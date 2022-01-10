import { PuzzlerRendered } from './puzzlerRendered';
import { Choices } from './choices';
import Grid from '@material-ui/core/Grid';
import { CodePaper } from './codePaper';
import { Footer } from './footer';
import React from 'react';
import { ofCurrentView, useSelector } from '../store/store';
import { CircularProgress } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { ProgressDialog } from './progressDialog';
import Typography from "@material-ui/core/Typography";
import {FeedbackToast} from "./feedbackToast";


const useStyles = makeStyles(theme => ({
    question: {
        margin: theme.spacing(.25),
    },
    spinnerRoot: {
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        position: 'absolute',
        top: 0,
    },
}));

export function MainView() {
    const htmlCode = useSelector(ofCurrentView('body', []));
    const styles = useStyles();

    const showProgressDialog = useSelector(state => state.showProgressDialog);

    const firstStatus = useSelector(state => {
        const currentStatus = state.puzzlerViews[state.current]?.status;
        if (currentStatus?.userChoice != null && state.current === state.puzzlerViews.length - 1) {
            if (currentStatus.userChoice === currentStatus.correctChoice && state.correctAnswers === 1) {
                return 'firstCorrect';
            }
            if (currentStatus.userChoice !== currentStatus.correctChoice && state.correctAnswers === state.puzzlerViews.length - 1) {
                return 'firstIncorrect';
            }
        }
        return undefined;
    });

    if (!htmlCode.length) {
        return <div className={ styles.spinnerRoot }>
            <CircularProgress/>
        </div>
    }

    if (showProgressDialog) {
        return <ProgressDialog/>
    }

    return <>
        <Typography variant='subtitle1' className={ styles.question }>Guess which CSS renders this:</Typography>
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
        {
            firstStatus &&
            <FeedbackToast correct={ firstStatus === 'firstCorrect' }/>
        }
    </>
}