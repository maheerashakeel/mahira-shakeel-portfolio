import gsap from 'gsap'

// One fixed WebGL canvas behind the whole site. It shows a soft photograph, keeps it gently moving,
// bends it around the pointer, and carries one image into the next as the page scrolls.
// Only transforms of texture coordinates: no CSS blur, so scrolling stays cheap.

// night, then one backdrop per project, then the two closing scenes. Set once, before the first render.
let worlds: string[] = ['/img/world/night.webp']
export function configureWorlds(urls: string[]) {
  worlds = urls
}
export const getWorlds = () => worlds

const IMAGE_ASPECT = 1.6

const VERT = `
attribute vec2 p;
varying vec2 v;
void main() { v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }
`

const FRAG = `
precision highp float;
varying vec2 v;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uCover;
uniform vec2 uMouse;
uniform vec2 uRes;
uniform float uMix;
uniform float uTime;
uniform float uAspect;
uniform float uPress;
uniform float uFlow;

vec2 cover(vec2 uv) { return clamp((uv - .5) * uCover + .5, .001, .999); }
float hash(vec2 q) { return fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = v;
  float t = uTime;

  // slow water-like drift, stronger while the page is moving
  vec2 w = vec2(
    sin(uv.y * 5. + t * .32) + .5 * sin(uv.y * 11. - t * .21),
    cos(uv.x * 4. - t * .27) + .5 * cos(uv.x * 9. + t * .17)
  );
  uv += w * (.0042 + uFlow * .012);

  // the photo bends around the pointer
  vec2 d = (v - uMouse) * vec2(uAspect, 1.);
  float r = length(d);
  float f = exp(-r * r * 7.);
  uv -= (v - uMouse) * f * .07 * uPress;
  uv += (d / (r + .001)) * f * sin(r * 24. - t * 2.) * .006 * uPress;

  // waves carry one image into the next
  float m = uMix;
  float bell = m * (1. - m) * 4.;
  vec2 tw = vec2(sin(v.y * 8. + t * .6), cos(v.x * 6. - t * .5)) * .04 * bell;
  vec3 a = texture2D(uA, cover(uv + tw)).rgb;
  vec3 b = texture2D(uB, cover(uv - tw)).rgb;
  float wave = sin(v.x * 5. + v.y * 3. + t * .4) * .14 + (v.y - .5) * .3;
  float e = smoothstep(.0, 1., clamp(m * 1.7 - .35 + wave, 0., 1.));
  vec3 c = mix(a, b, e);

  // edges fall away into the dark, film grain keeps it photographic
  float vg = smoothstep(1.2, .35, length((v - .5) * vec2(1.2, 1.)));
  c *= mix(.6, 1., vg);
  c += (hash(v * uRes + fract(t) * 91.) - .5) * .05;

  gl_FragColor = vec4(c, 1.);
}
`

type Ambient = {
  destroy: () => void
}

let index = 0
let flowTarget = 0
let requestDraw: (() => void) | null = null
let firstReady: (() => void) | null = null
const ready = new Promise<void>(res => (firstReady = res))

export const worldReady = () => ready

export function setWorld(i: number) {
  const before = Math.round(index)
  index = Math.min(worlds.length - 1, Math.max(0, i))
  requestDraw?.()
  if (Math.round(index) !== before) window.dispatchEvent(new CustomEvent('world:change', { detail: index }))
}
export const getWorld = () => index

// stops drawing while a demo video is open, so the video gets the whole graphics budget
let paused = false
export function pauseWorld(value: boolean) {
  paused = value
}

export function setFlow(velocity: number) {
  flowTarget = Math.min(1, Math.abs(velocity) / 40)
}

export function createAmbient(canvas: HTMLCanvasElement, animate: boolean): Ambient | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const u = (n: string) => gl.getUniformLocation(prog, n)
  const U = {
    a: u('uA'), b: u('uB'), cover: u('uCover'), mouse: u('uMouse'), res: u('uRes'), mix: u('uMix'),
    time: u('uTime'), aspect: u('uAspect'), press: u('uPress'), flow: u('uFlow'),
  }
  gl.uniform1i(U.a, 0)
  gl.uniform1i(U.b, 1)

  const textures: (WebGLTexture | null)[] = worlds.map(() => null)
  let dead = false
  const load = (i: number) =>
    new Promise<void>(res => {
      const img = new Image()
      img.decoding = 'async'
      img.crossOrigin = 'anonymous' // uploaded backdrops live on another domain
      img.onload = () => {
        if (dead) return res()
        const tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        textures[i] = tex
        requestDraw?.()
        res()
      }
      img.onerror = () => res()
      img.src = worlds[i]
    })
  // the first image gates the intro, the rest arrive one at a time behind it
  void load(0).then(async () => {
    firstReady?.()
    for (let i = 1; i < worlds.length; i++) await load(i)
  })

  const resize = () => {
    // the image is soft, so about a million pixels looks the same as a full 4K canvas at a fraction of the cost
    const scale = Math.min(1, Math.sqrt(1_000_000 / (window.innerWidth * window.innerHeight)))
    const w = Math.round(window.innerWidth * scale)
    const h = Math.round(window.innerHeight * scale)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    const aspect = w / h
    gl.uniform2f(U.cover, aspect > IMAGE_ASPECT ? 1 : aspect / IMAGE_ASPECT, aspect > IMAGE_ASPECT ? IMAGE_ASPECT / aspect : 1)
    gl.uniform1f(U.aspect, aspect)
    gl.uniform2f(U.res, w, h)
    requestDraw?.()
  }

  const mouse = { x: 0.68, y: 0.55, tx: 0.68, ty: 0.55, press: 0, pressTarget: 0 }
  let flow = 0
  const onMove = (e: PointerEvent) => {
    mouse.tx = e.clientX / window.innerWidth
    mouse.ty = 1 - e.clientY / window.innerHeight
    mouse.pressTarget = 1
  }

  const draw = (time: number) => {
    const i = Math.floor(index)
    const next = Math.min(worlds.length - 1, i + 1)
    const a = textures[i] ?? textures.find(Boolean)
    if (!a) return
    const b = textures[next] ?? a
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, a)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, b)
    gl.uniform1f(U.mix, index - i)
    gl.uniform1f(U.time, time)
    gl.uniform1f(U.flow, flow)
    gl.uniform1f(U.press, mouse.press)
    gl.uniform2f(U.mouse, mouse.x, mouse.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  let frame = 0
  let lastIndex = index
  const tick = (time: number) => {
    if (document.hidden || paused) return
    frame += 1
    const busy = index !== lastIndex || flowTarget > 0.01 || mouse.pressTarget > 0.05
    lastIndex = index
    if (!busy && frame % 2) return
    mouse.x += (mouse.tx - mouse.x) * 0.07
    mouse.y += (mouse.ty - mouse.y) * 0.07
    mouse.press += (mouse.pressTarget - mouse.press) * 0.05
    mouse.pressTarget *= 0.985
    flow += (flowTarget - flow) * 0.08
    flowTarget *= 0.92
    draw(time)
  }

  requestDraw = animate ? null : () => draw(0)
  resize()
  window.addEventListener('resize', resize)
  if (animate) {
    window.addEventListener('pointermove', onMove, { passive: true })
    gsap.ticker.add(tick)
  }

  return {
    destroy() {
      dead = true
      requestDraw = null
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      gsap.ticker.remove(tick)
    },
  }
}
