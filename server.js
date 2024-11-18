import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  app.use(vite.middlewares)

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl
  
    try {
      const indexHtmlStr = fs.readFileSync(
        path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            'index.html',
        ),
        'utf-8',
      )
  
      const template = await vite.transformIndexHtml(url, indexHtmlStr)
  
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
  
      const appHtml = await render(url)
  
      const html = template.replace(`<!--ssr-outlet-->`, appHtml)
  
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })

  app.listen(3000)
}

createServer()
