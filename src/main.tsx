import '@fontsource-variable/schibsted-grotesk/wght.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './index.css'
import { configureWorlds } from './lib/ambient'
import { appProjects, content, webProjects } from './lib/content'

document.title = content.seo.title
document.querySelector('meta[name="description"]')?.setAttribute('content', content.seo.description)
configureWorlds([
  '/img/world/night.webp',
  ...webProjects.map(p => p.world || '/img/world/night.webp'),
  ...(appProjects.length ? [appProjects[0].world || '/img/world/night.webp'] : []),
  '/img/world/lights.webp',
  '/img/world/garden.webp',
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
