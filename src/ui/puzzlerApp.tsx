import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { genAndDisplayNewPuzzler, restoreAndDisplay } from '../store/thunks';
import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from './theme';
import { BrowserRouter } from 'react-router-dom';
import { MyAppBar } from './myAppBar';
import { MyAppBody } from './myAppBody';
import { store } from '../store/store';
import { readFromLocalStorage } from '../store/myLocalStorage';
import { gaInit } from './ga';

export function PuzzlerApp(p: {basename: string | undefined}): ReactElement {
    const [paletteMode, setPaletteType] = useState<PaletteMode>('light');

    useEffect(() => {
        gaInit();
        const storedPersistent = readFromLocalStorage(store.persistent._version);
        if (storedPersistent) {
            restoreAndDisplay(storedPersistent);
        } else {
            genAndDisplayNewPuzzler();
        }
        document.getElementById('loading-screen-style')!.remove();
    }, []);

    const theme = useMemo(() => createTheme(paletteMode), [paletteMode]);

    return <ThemeProvider theme={ theme }>
        <CssBaseline/>
            <BrowserRouter>
                <MyAppBar paletteMode={ paletteMode } setPaletteMode={ setPaletteType }/>
                <MyAppBody basename={ p.basename }/>
            </BrowserRouter>
    </ThemeProvider>;
}

