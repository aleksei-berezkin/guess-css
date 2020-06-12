import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux/store';
import { navNextPuzzler, navPrevPuzzler } from '../redux/actions';
import { Dispatch } from 'redux';
import { checkChoice, genNewPuzzler, initClient } from '../redux/thunks';
import { range, stream } from '../stream/stream';
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

const iframeSize = {
    width: 240,
    height: 160,
}

const useStyles = makeStyles(theme => ({
    iframe: {
        ...iframeSize,
        border: 'none',
    },
    iframePaper: iframeSize
}));

export function Puzzler(): ReactElement {
    const dispatch = useDispatch();
    useEffect(() => {dispatch(initClient())}, ['const']);
    const htmlCode = useSelector(state => state.puzzlerViews[state.current]?.bodyInnerCode || []);

    return <>
        <MyAppBar/>
        <Grid container direction='column' alignItems='center'>
            <PuzzlerRendered/>
            <Choices/>
            <Grid item>
                <CodePaper title='HTML' lines={ htmlCode }/>
            </Grid>
        </Grid>
    </>
}

function MyAppBar() {
    return <>
        <AppBar>
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
    const choicesCount = useSelector(state => state.puzzlerViews[state.current]?.styleCodes.length);
    const choiceCodes = useSelector(state => state.puzzlerViews[state.current]?.styleCodes || []);

    return <Grid container justify='center'>{
        choicesCount &&
        range(0, choicesCount)
            .map((i: number) =>
                <Grid item key={ `${keyBase}_${i}` }>
                    <CodePaper title={ `CSS ${i + 1}` } lines={ choiceCodes[i] }>
                        <Grid container justify='center'>
                            <Grid item>
                                <Button variant='outlined' color='primary' size='small'>This!</Button>
                            </Grid>
                        </Grid>
                    </CodePaper>
                </Grid>
            )
            .toArray()
    }</Grid>
}

// function Choice(p: {choice: number}): ReactElement {
//     const choiceCode = useSelector(state => state.puzzlerViews[state.current]?.styleCodes[p.choice]);
//     const correctChoice = useSelector(state => state.puzzlerViews[state.current]?.correctChoice);
//     const userChoice = useSelector(state => state.puzzlerViews[state.current]?.userChoice);
//
//     const highlight = (() => {
//         if (userChoice != null && correctChoice === p.choice) {
//             return 'correct';
//         }
//         if (userChoice === p.choice) {
//             return 'incorrect';
//         }
//         return '';
//     })();
//     const outline = (() => {
//         if (userChoice === p.choice) {
//             return 'user-choice';
//         }
//         return '';
//     })();
//
//     const dispatch = useDispatch();
//
//     function handleClick() {
//         if (userChoice == null) {
//             dispatch(checkChoice(p.choice));
//         }
//     }
//
//     const active = userChoice == null ? 'active' : '';
//     return <div className={ `code ${ highlight } ${ outline } ${ active }` } onClick={ handleClick }>
//         <Lines lines={choiceCode}/>
//     </div>;
// }
