import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ofCurrentView, State } from '../redux/store';
import { resetSsrData } from '../redux/actions';
import { gaInit, gaNewPuzzler, initClient } from '../redux/thunks';
import { stream } from '../stream/stream';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import { CodePaper } from './codePaper';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Choices } from './choices';
import { STYLE_ID } from '../../../templateConst';
import { PaletteType } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from './theme';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import BrightnessHigh from '@material-ui/icons/BrightnessHigh';
import { Footer } from './footer';
import { BrowserRouter, Route, StaticRouter, Switch } from 'react-router-dom';
import { Credits } from './credits';
import { ScrollToTop } from './scrollToTop';
import { routes } from '../routes';
import { PuzzlerRendered } from './puzzlerRendered';

export function PuzzlerApp(p: { staticRoute?: string }): ReactElement {
    const ssr = useSelector(state => state.ssr);
    const [paletteType, setPaletteType] = useState<PaletteType>('light');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(gaInit());
        if (ssr) {
            dispatch(resetSsrData());
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
        <MyAppBar paletteType={ paletteType } setPaletteType={ setPaletteType }/>
        {
            p.staticRoute &&
            <StaticRouter location={ p.staticRoute }>
                <AppBody/>
            </StaticRouter>
        }
        {
            !p.staticRoute &&
            <BrowserRouter>
                <AppBody/>
            </BrowserRouter>
        }
    </ThemeProvider>;
}

function MyAppBar(p: {paletteType: PaletteType, setPaletteType: (paletteType: PaletteType) => void}) {
    const togglePaletteType = () => {
        if (p.paletteType === 'light') {
            p.setPaletteType('dark');
        } else {
            p.setPaletteType('light');
        }
    };

    return <>
        <AppBar color={ p.paletteType === 'light' ? 'primary' : 'default' }>
            <Toolbar variant='dense'>
                <Container maxWidth='sm' disableGutters>
                    <Grid container alignItems='center'>
                        <Grid item style={{ flexGrow: 1 }}>
                            <Typography variant="h6">
                                Guess CSS!
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Score/>
                            <DonePuzzler/>
                        </Grid>
                        <Grid item style={{ flexGrow: 1.38127 }}>
                            <IconButton onClick={ togglePaletteType } style={{ float: 'right' }}>
                                {
                                    p.paletteType === 'light' &&
                                    <Brightness2Icon htmlColor='white' titleAccess='dark theme'/> ||
                                    <BrightnessHigh titleAccess='lightTheme'/>
                                }
                            </IconButton>
                        </Grid>
                    </Grid>
                </Container>
            </Toolbar>
        </AppBar>
        <Toolbar variant='dense'/>
    </>;
}

function Score() {
    const isLast = useSelector(state => state.current === state.puzzlerViews.length - 1);
    const correctAnswers = useSelector(state => state.correctAnswers);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum)

    return <>{
        isLast &&
        <Typography>Score: { correctAnswers } of { donePuzzlersNum }</Typography>
    }</>;
}

function DonePuzzler() {
    const isHistory = useSelector(state => state.current < state.puzzlerViews.length - 1);
    const historyPuzzlerPos = useSelector(state => state.current + 1);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum);

    return <>{
        isHistory &&
        <Typography>Done: { historyPuzzlerPos } of { donePuzzlersNum }</Typography>
    }</>
}

function getDonePuzzlersNum(state: State) {
    if (!state.puzzlerViews.length) {
        return 0;
    }
    if (stream(state.puzzlerViews).last().orElseUndefined()?.status.userChoice != null) {
        return state.puzzlerViews.length;
    }
    return state.puzzlerViews.length - 1;
}

function AppBody() {
    const htmlCode = useSelector(ofCurrentView('body', []));

    return <>
        <ScrollToTop />
        <Switch>
            <Route path={ routes.root } exact>
                <Grid container direction='column' alignItems='center' component='main'>
                    <PuzzlerRendered/>
                    <Choices/>
                    <Grid item>
                        <CodePaper body={{
                            code: htmlCode,
                        }} />
                    </Grid>
                    <Grid item>
                        <Footer/>
                    </Grid>
                </Grid>
            </Route>
            <Route path={ routes.credits }>
                <Container maxWidth='sm'>
                    <Credits />
                </Container>
            </Route>
        </Switch>
    </>
}
