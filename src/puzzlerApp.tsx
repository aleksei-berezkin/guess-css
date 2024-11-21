'use client'

import { useEffect } from 'react';
import { genAndDisplayNewPuzzler, restoreAndDisplay } from './store/thunks';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { PuzzlerAppBar } from './puzzlerAppBar';
import { PuzzlerAppBody } from './puzzlerAppBody';
import { store } from './store/store';
import { readFromLocalStorage } from './store/myLocalStorage';
import { gaInit } from './ga';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server'
import { routes } from './routes';
import IndexPage from './page';
import AboutPage from './about/page';
import CreditsPage from './credits/page';
import SelectPage from './select/page';


export function PuzzlerApp(p: {location?: string}) {
    useEffect(() => {
        gaInit();
        const storedPersistent = readFromLocalStorage(store.persistent._version);
        if (storedPersistent) {
            restoreAndDisplay(storedPersistent);
        } else {
            genAndDisplayNewPuzzler();
        }
    }, []);


    return <ThemeProvider theme={ theme } defaultMode='system'>
        <CssBaseline/>
        {
            p.location != null
                ? <StaticRouter location={ p.location }><RouterBody/></StaticRouter>
                : <BrowserRouter><RouterBody/></BrowserRouter>
        }
    </ThemeProvider>;
}

function RouterBody() {
    return <>
        <PuzzlerAppBar/>
        <PuzzlerAppBody>
            <Routes>
                <Route path={ routes.root } element={ <IndexPage/> } />
                <Route path={ routes.about } element={ <AboutPage/> } />
                <Route path={ routes.credits } element={ <CreditsPage/> } />
                <Route path={ routes.select } element={ <SelectPage/> } />
            </Routes>
        </PuzzlerAppBody>
    </>
}
