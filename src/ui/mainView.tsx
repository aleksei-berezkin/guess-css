import { PuzzlerRendered } from './puzzlerRendered';
import { Choices } from './choices';
import { CodePaper } from './codePaper';
import { Footer } from './footer';
import React from 'react';
import { ofCurrentView, useSelector } from '../store/store';
import { CircularProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { ProgressDialog } from './progressDialog';
import { FeedbackToast } from './feedbackToast';


const useStyles = makeStyles(theme => ({
    question: {
        marginTop: theme.spacing(.5),
        marginBottom: theme.spacing(.5),
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
        const currentStatus = state.persistent.puzzlerViews[state.current]?.status;
        if (currentStatus?.userChoice != null && state.current === state.persistent.puzzlerViews.length - 1) {
            if (currentStatus.userChoice === currentStatus.correctChoice && state.persistent.correctAnswers === 1) {
                return 'firstCorrect';
            }
            if (currentStatus.userChoice !== currentStatus.correctChoice && state.persistent.correctAnswers === state.persistent.puzzlerViews.length - 1) {
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
        <PuzzlerRendered/>
        <Choices/>
        <div>
            <CodePaper body={{
                code: htmlCode,
            }} />
        </div>
        <Footer/>
        {
            firstStatus &&
            <FeedbackToast correct={ firstStatus === 'firstCorrect' }/>
        }
    </>
}