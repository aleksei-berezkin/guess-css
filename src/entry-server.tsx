import { PuzzlerApp } from './puzzlerApp'
import { renderToString } from 'react-dom/server'

export function render(url: string) {
    const html = renderToString(
        <PuzzlerApp url={ url }/>        

    )
    console.log(html)
    return html
}
