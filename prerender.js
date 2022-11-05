import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

import { render } from './dist/server/entry-server.js'
const toAbsolute = (p) => path.resolve(path.dirname(fileURLToPath(import.meta.url)), p)

const manifest = JSON.parse(fs.readFileSync(toAbsolute('dist/ssr-manifest.json'), 'utf-8'))
const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8')

// pre-render each route...

const [appHtml, preloadLinks] = await render(manifest)

const html = template
.replace('<!--preload-links-->', preloadLinks)
.replace('<!--app-html-->', appHtml)

const filePath = 'dist/index.html'
fs.writeFileSync(toAbsolute(filePath), html)
console.log('pre-rendered:', filePath)

// done, delete ssr manifest
fs.rmSync(toAbsolute('dist/ssr-manifest.json'))
fs.rmSync(toAbsolute('dist/server'), {recursive: true})
