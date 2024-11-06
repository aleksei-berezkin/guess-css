'use client'

import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { genAndDisplayNewPuzzler, restoreAndDisplay } from './store/thunks';
import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from './theme';
import { PuzzlerAppBar } from './puzzlerAppBar';
import { PuzzlerAppBody } from './puzzlerAppBody';
import { store } from './store/store';
import { readFromLocalStorage } from './store/myLocalStorage';
import { gaInit } from './ga';

export function PuzzlerApp(p: { children: React.ReactNode }): ReactElement {
    const [paletteMode, setPaletteMode] = useState<PaletteMode>('light')
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setPaletteMode(mediaQuery.matches ? 'dark' : 'light')

        const l = (e: MediaQueryListEvent) => setPaletteMode(e.matches ? 'dark' : 'light')
        mediaQuery.addEventListener('change', l)
        return () => mediaQuery.removeEventListener('change', l)
    }, []);
    
    useEffect(() => {
        gaInit();
        const storedPersistent = readFromLocalStorage(store.persistent._version);
        if (storedPersistent) {
            restoreAndDisplay(storedPersistent);
        } else {
            genAndDisplayNewPuzzler();
        }
    }, []);

    const theme = useMemo(() => createTheme(paletteMode), [paletteMode]);

    return <ThemeProvider theme={ theme }>
        <CssBaseline/>
            <PuzzlerAppBar paletteMode={ paletteMode } setPaletteMode={ setPaletteMode }/>
            <PuzzlerAppBody>
                { p.children }
            </PuzzlerAppBody>
    </ThemeProvider>;
}
