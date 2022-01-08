import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { gaInit, genAndDisplayNewPuzzler } from '../store/thunks';
import CssBaseline from '@material-ui/core/CssBaseline';
import { PaletteType } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from './theme';
import { BrowserRouter } from 'react-router-dom';
import { MyAppBar } from './myAppBar';
import { MyAppBody } from './myAppBody';
import { store } from '../store/store';
import { allTopics } from '../model/topic';

export function PuzzlerApp(p: {basename: string | undefined}): ReactElement {
    const [paletteType, setPaletteType] = useState<PaletteType>('light');

    useEffect(() => {
        gaInit();
        store.reset(allTopics);
        genAndDisplayNewPuzzler();
        document.getElementById('loading-screen-style')!.remove();
    }, []);

    const theme = useMemo(() => createTheme(paletteType), [paletteType]);

    return <ThemeProvider theme={ theme }>
        <CssBaseline/>
            <BrowserRouter>
                <MyAppBar paletteType={ paletteType } setPaletteType={ setPaletteType }/>
                <MyAppBody basename={ p.basename }/>
            </BrowserRouter>
    </ThemeProvider>;
}
