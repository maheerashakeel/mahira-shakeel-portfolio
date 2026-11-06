// Makes the two images a new project needs, then you add its entry to src/data/content.ts.
//   From a live site:    node tools/add-project.mjs my-project https://example.com
//   From a screenshot:   node tools/add-project.mjs my-app ./screen.png --phone
// Writes public/img/work/<id>.webp (the sharp screen) and public/img/world/<id>.webp (the soft backdrop).
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { chromium } from 'playwright-core'
import sharp from 'sharp'

const [id, source] = process.argv.slice(2)
const phone = process.argv.includes('--phone')
if (!id || !source || !/^[a-z0-9-]+$/.test(id)) {
  console.error('Usage: node tools/add-project.mjs <lowercase-id> <url-or-image-file> [--phone]')
  process.exit(1)
}

async function capture(url) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(3000)
  const shot = await page.screenshot()
  await browser.close()
  return shot
}

const input = /^https?:\/\//.test(source) ? await capture(source) : resolve(source)
mkdirSync('public/img/work', { recursive: true })
mkdirSync('public/img/world', { recursive: true })

await sharp(input)
  .resize(phone ? { height: 1520 } : { width: 1760 })
  .webp({ quality: 80 })
  .toFile(`public/img/work/${id}.webp`)

// the backdrop: the same screen, out of focus, pulled down into the dark, darker on the text side
const small = await sharp(input).resize(640, 400, { fit: 'cover', position: 'top' }).blur(22).removeAlpha().toBuffer()
const { channels } = await sharp(small).stats()
const mean = (0.2126 * channels[0].mean + 0.7152 * channels[1].mean + 0.0722 * channels[2].mean) / 255
const shade = Buffer.from(
  `<svg width="640" height="400"><defs><linearGradient id="g"><stop offset="0.1" stop-color="#000" stop-opacity="0.62"/><stop offset="0.62" stop-color="#000" stop-opacity="0"/></linearGradient></defs><rect width="640" height="400" fill="url(#g)"/></svg>`,
)
// composite first: sharp runs resize before composite when they share one pipeline
const graded = await sharp(small)
  .modulate({ brightness: Math.min(1.1, 0.26 / Math.max(mean, 0.05)), saturation: 1.4 })
  .composite([{ input: shade }])
  .toBuffer()
await sharp(graded)
  .resize(1280, 800, { kernel: 'cubic' })
  .webp({ quality: 74 })
  .toFile(`public/img/world/${id}.webp`)

console.log(`Done. Add this project to src/data/content.ts with:
  shot: '/img/work/${id}.webp',
  world: '/img/world/${id}.webp',
  frame: '${phone ? 'phone' : 'monitor'}',`)
