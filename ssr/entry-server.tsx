import { PuzzlerApp } from '../src/puzzlerApp'
import { renderToString } from 'react-dom/server'
import createCache from '@emotion/cache'
import path from 'node:path'
import fs from 'node:fs'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'

// https://mui.com/material-ui/guides/server-rendering/
export async function render(url: string, projectRootDir: string) {
    const indexHtmlPath = path.join(projectRootDir, 'dist', 'index.html')
    const indexHtml = String(await fs.promises.readFile(indexHtmlPath))

    const cache = createCache({ key: 'css'})
    const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)

    const html = renderToString(
        <CacheProvider value={ cache }>
            <PuzzlerApp url={ url }/>
        </CacheProvider>
    )

    const emotionChunks = extractCriticalToChunks(html);
    const emotionCss = constructStyleTagsFromChunks(emotionChunks);

    const newIndexHtml = indexHtml
        .replace('<!--css-placeholder-->', emotionCss)
        .replace('<!--html-placeholder-->', html)

    fs.writeFileSync(indexHtmlPath, newIndexHtml)
}
