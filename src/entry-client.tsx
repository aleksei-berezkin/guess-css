import { createRoot, hydrateRoot } from 'react-dom/client'
import { PuzzlerApp } from './puzzlerApp'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { Router } from 'wouter'

const appRootDiv = document.getElementById('app-root-div')

if (appRootDiv.childNodes[0]?.nodeType === Node.COMMENT_NODE) {
    // dev
    createRoot(appRootDiv!).render(
        <PuzzlerApp />
    )
} else {
    const cache = createCache({ key: 'css' })
    hydrateRoot(
        appRootDiv,
        <CacheProvider value={ cache }>
            <Router>
                <PuzzlerApp/>
            </Router>
        </CacheProvider>
    )
}
