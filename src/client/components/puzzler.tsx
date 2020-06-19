import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux/store';
import { navNextPuzzler, navPrevPuzzler } from '../redux/actions';
import { Dispatch } from 'redux';
import { genNewPuzzler, initClient } from '../redux/thunks';
import { stream } from '../stream/stream';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { CodePaper } from './codePaper';
import CssBaseline from '@material-ui/core/CssBaseline';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { ThemeProvider } from '@material-ui/core/styles';
import { CodeHeader } from './codeHeader';
import { Choices } from './choices';

declare module '@material-ui/core/styles/createBreakpoints' {
    // noinspection JSUnusedGlobalSymbols
    interface BreakpointOverrides {
        narrow: true;
    }
}

const theme = createMuiTheme({
    breakpoints: {
        values: {
            xs: 0,
            narrow: 350,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
    palette: {
        type: 'light',
    },
    props: {
        MuiPaper: {
            square: true,
        },
    },
});

const useStyles = makeStyles(theme => ({
    layoutSize: {
        height: 160,
        width: 190,
        [theme.breakpoints.up('narrow')]: {
            width: 240,
        },
    },
    iframe: {
        border: 'none',
    },
    iframePaper: {
        marginTop: theme.spacing(1),
    },
}));

export function Puzzler(): ReactElement {
    const dispatch = useDispatch();
    useEffect(() => {dispatch(initClient())}, ['const']);
    const htmlCode = useSelector(state => state.puzzlerViews[state.current]?.body || []);

    return <ThemeProvider theme={ theme }>
        <CssBaseline/>
        <MyAppBar/>
        <Grid container direction='column' alignItems='center'>
            <PuzzlerRendered/>
            <Choices/>
            <Grid item>
                <CodePaper
                    header={ <CodeHeader title='HTML'/> }
                    code={ htmlCode }
                />
            </Grid>
        </Grid>
    </ThemeProvider>
}

function MyAppBar() {
    return <>
        <AppBar color='primary'>
            <Toolbar variant='dense'>
                <Container maxWidth='sm'>
                    <Grid container  justify='space-between' alignItems='baseline'>
                        <Grid item>
                            <Typography variant="h6">
                                Guess CSS!
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Score/>
                            <DonePuzzler/>
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

function PuzzlerRendered() {
    const source = useSelector(state => state.puzzlerViews[state.current]?.source);
    const classes = useStyles();

    return <Grid container justify='center' alignItems='center'>
        <Grid item>
            <PrevButton/>
        </Grid>
        <Grid item>{
            source &&
            <Paper className={ `${classes.layoutSize} ${classes.iframePaper}` }>
                <iframe className={ `${classes.layoutSize} ${classes.iframe}` } srcDoc={ source }/>
            </Paper>
        }</Grid>
        <Grid item>
            <NextButton/>
        </Grid>
    </Grid>;
}

function PrevButton() {
    const hasPrev = useSelector(state => state.current > 0);
    const dispatch: Dispatch = useDispatch();

    function handlePrev() {
        if (hasPrev) {
            dispatch(navPrevPuzzler());
        } else {
            throw new Error('Cannot navPrev')
        }
    }

    return <IconButton onClick={ handlePrev } disabled={ !hasPrev }>
        <KeyboardArrowLeft/>
    </IconButton>;
}

function NextButton() {
    const hasNext = useSelector(state => state.current < state.puzzlerViews.length - 1);
    const isAnswered = useSelector(state => state.puzzlerViews[state.puzzlerViews.length - 1]?.status.userChoice != null);
    const dispatch = useDispatch();

    function handleNext() {
        if (hasNext) {
            dispatch(navNextPuzzler());
        } else if (isAnswered) {
            dispatch(genNewPuzzler(false));
        } else {
            throw new Error('Cannot navNext');
        }
    }

    return <IconButton onClick={ handleNext } disabled={ !hasNext && !isAnswered } color={ isAnswered ? 'primary' : 'default' }>
        <KeyboardArrowRight/>
    </IconButton>;
}
