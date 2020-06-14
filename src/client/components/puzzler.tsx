import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ofCurrentView, State } from '../redux/store';
import { navNextPuzzler, navPrevPuzzler } from '../redux/actions';
import { Dispatch } from 'redux';
import { checkChoice, genNewPuzzler, initClient } from '../redux/thunks';
import { abc, stream } from '../stream/stream';
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
import Button from '@material-ui/core/Button';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CheckIcon from '@material-ui/icons/Check';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CssBaseline from '@material-ui/core/CssBaseline';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { ThemeProvider } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

const theme = createMuiTheme({
    palette: {
        type: 'light',
    },
    props: {
        MuiPaper: {
            square: true,
        },
    },
});

const iframeSize = {
    width: 240,
    height: 160,
}

const useStyles = makeStyles(theme => ({
    iframe: {
        ...iframeSize,
        border: 'none',
    },
    iframePaper: {
        ...iframeSize,
        marginTop: theme.spacing(1),
    },
    successBg: {
        backgroundColor: green['A100'],
    },
    errorBg: {
        backgroundColor: red ['A100'] ,
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
                <CodePaper title='HTML' code={ htmlCode }/>
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
    if (stream(state.puzzlerViews).last().orElseUndefined()?.userChoice != null) {
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
            source && <Paper className={ classes.iframePaper }><iframe className={ classes.iframe } srcDoc={ source }/></Paper>
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
    const isAnswered = useSelector(state => state.puzzlerViews[state.puzzlerViews.length - 1]?.userChoice != null);
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

function Choices(): ReactElement {
    const keyBase = useSelector(state => `${state.current}_`);

    const choices = useSelector(ofCurrentView(v => v?.styleChoices || []));
    const common = useSelector(ofCurrentView(v => v?.commonStyle || []));

    const correctChoice = useSelector(ofCurrentView(v => v?.correctChoice));
    const userChoice = useSelector(ofCurrentView(v => v?.userChoice));

    const btnBoxRef = useRef<HTMLDivElement | null>(null);
    const [btnBoxStyle, setBtnBoxStyle] = useState({} as { minHeight?: number });

    const dispatch = useDispatch();

    const classes = useStyles();

    function onClickChoice(choice: number) {
        if (userChoice == null) {
            setBtnBoxStyle({ minHeight: btnBoxRef.current!.getBoundingClientRect().height })
            dispatch(checkChoice(choice));
        }
    }

    return <Grid container justify='center'>{
        abc().zipWithIndex().take(choices.length)
            .map(([letter, i]) =>
                <Grid item key={ `${keyBase}_${i}` }>
                    <CodePaper title={ `CSS ${letter.toUpperCase()}` } code={ choices[i] || [] } headerClass={
                        i === correctChoice && userChoice != null && classes.successBg ||
                        i === userChoice && userChoice !== correctChoice &&  classes.errorBg ||
                        undefined
                    } collapsedCode={ common }>
                        <Grid container justify='center'>
                            <Grid item ref={ btnBoxRef } style={ btnBoxStyle }>
                                {
                                    userChoice == null && 
                                    <Button onClick={() => onClickChoice(i) } disabled={ userChoice != null }
                                            variant='outlined' color='primary' size='small'>This!</Button>
                                }
                                {
                                    i === userChoice && userChoice === correctChoice &&
                                    <CheckCircleOutlineIcon color='primary'/>
                                }
                                {
                                    i === correctChoice && userChoice != null && userChoice !== correctChoice &&
                                    <CheckIcon/>
                                }
                                {
                                    i === userChoice && userChoice !== correctChoice &&
                                    <ErrorOutlineIcon/>
                                }
                            </Grid>
                        </Grid>
                    </CodePaper>
                </Grid>
            )
            .toArray()
    }</Grid>
}
