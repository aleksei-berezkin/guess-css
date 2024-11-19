import { PuzzlerApp } from '../src/puzzlerApp'
import { renderToString } from 'react-dom/server'
import path from 'node:path'
import fs from 'node:fs'

export async function render(url: string, projectRootDir: string) {
    console.log(projectRootDir)

    const indexHtml = String(await fs.promises.readFile(path.join(projectRootDir, 'dist', 'index.html') ))
    console.log(indexHtml)
    console.log()
    console.log()

    const html = renderToString(
        <PuzzlerApp url={ url }/>

    )
    console.log(html)
}
