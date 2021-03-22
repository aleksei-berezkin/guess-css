import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { gaInit, genNewPuzzler } from '../redux/thunks';
import CssBaseline from '@material-ui/core/CssBaseline';
import { PaletteType } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from './theme';
import { BrowserRouter } from 'react-router-dom';
import { MyAppBar } from './myAppBar';
import { MyAppBody } from './myAppBody';
import { topics } from '../redux/slices/topics';
import { getRandomizedTopics } from '../model/gen/genPuzzler';

export function PuzzlerApp(p: {basename: string | undefined}): ReactElement {
    const [paletteType, setPaletteType] = useState<PaletteType>('light');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(gaInit());
        dispatch(topics.actions.set(getRandomizedTopics()));
        dispatch(genNewPuzzler(true));
        document.getElementById('loading-screen-style')!.remove();
    }, []);

    const theme = useMemo(() => createTheme(paletteType), [paletteType]);

    return <ThemeProvider theme={ theme }>
        <CssBaseline/>
            <BrowserRouter basename={ p.basename }>
                <MyAppBar paletteType={ paletteType } setPaletteType={ setPaletteType }/>
                <MyAppBody/>
            </BrowserRouter>
    </ThemeProvider>;
}
