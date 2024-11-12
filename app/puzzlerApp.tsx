'use client'

import React, { ReactElement, useEffect } from 'react';
import { genAndDisplayNewPuzzler, restoreAndDisplay } from './store/thunks';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { PuzzlerAppBar } from './puzzlerAppBar';
import { PuzzlerAppBody } from './puzzlerAppBody';
import { store } from './store/store';
import { readFromLocalStorage } from './store/myLocalStorage';
import { gaInit } from './ga';

export function PuzzlerApp(p: { children: React.ReactNode }): ReactElement {
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
        <PuzzlerAppBar/>
        <PuzzlerAppBody>
            { p.children }
        </PuzzlerAppBody>
    </ThemeProvider>;
}
