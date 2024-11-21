import { PuzzlerApp } from '../src/puzzlerApp'
import { renderToString } from 'react-dom/server'
import createCache from '@emotion/cache'
import path from 'node:path'
import fs from 'node:fs'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { routes } from '../src/routes'
import { Router } from 'wouter'

// https://mui.com/material-ui/guides/server-rendering/
export async function render(projectRootDir: string) {
    const distPath = path.join(projectRootDir, 'dist')
    const indexHtml = String(await fs.promises.readFile(path.join(distPath, 'index.html')))

    for (const route of Object.values(routes)) {
        const cache = createCache({ key: 'css'})
        const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)

        const html = renderToString(
            <CacheProvider value={ cache }>
                <Router ssrPath={ route }>
                    <PuzzlerApp location={ route }/>
                </Router>
            </CacheProvider>
        )
    
        const emotionChunks = extractCriticalToChunks(html);
        const emotionCss = constructStyleTagsFromChunks(emotionChunks);
    
        const prerenderedHtml = indexHtml
            .replace('<!--css-placeholder-->', emotionCss)
            .replace('<!--html-placeholder-->', html)

        const fileName = route === '/'
            ? 'index.html'
            : route.replace(/^\//, '') + '.html'

        fs.writeFileSync(path.join(distPath, fileName), prerenderedHtml)
    }
}
