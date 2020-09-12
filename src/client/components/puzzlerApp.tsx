import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gaInit, gaNewPuzzler, initClient } from '../redux/thunks';
import CssBaseline from '@material-ui/core/CssBaseline';
import { STYLE_ID } from '../../../templateConst';
import { PaletteType } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from './theme';
import { BrowserRouter, StaticRouter } from 'react-router-dom';
import { ssr as ssrSlice } from '../redux/slices/ssr';
import { MyAppBar } from './myAppBar';
import { MyAppBody } from './myAppBody';

export function PuzzlerApp(p: { staticRoute?: string }): ReactElement {
    const ssr = useSelector(state => state.ssr);
    const [paletteType, setPaletteType] = useState<PaletteType>('light');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(gaInit());
        if (ssr) {
            dispatch(ssrSlice.actions.reset());
            const jssStyles = document.getElementById(STYLE_ID)!;
            jssStyles.parentElement!.removeChild(jssStyles);
            dispatch(gaNewPuzzler());
        } else {
            dispatch(initClient());
        }
    }, []);

    const theme = useMemo(() => createTheme(paletteType), [paletteType]);

    return <ThemeProvider theme={ theme }>
        <CssBaseline/>
        {
            p.staticRoute &&
            <StaticRouter location={ p.staticRoute }>
                <MyAppBar paletteType={ paletteType } setPaletteType={ setPaletteType }/>
                <MyAppBody/>
            </StaticRouter>
        }
        {
            !p.staticRoute &&
            <BrowserRouter>
                <MyAppBar paletteType={ paletteType } setPaletteType={ setPaletteType }/>
                <MyAppBody/>
            </BrowserRouter>
        }
    </ThemeProvider>;
}
