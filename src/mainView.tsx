import { PuzzlerRendered } from './puzzlerRendered';
import { Choices } from './choices';
import { CodePaper } from './codePaper';
import { Footer } from './footer';
import { ofCurrentView, useSelector } from './store/store';
import { Box, CircularProgress } from '@mui/material';
import { ProgressDialog } from './progressDialog';
import { FeedbackToast } from './feedbackToast';


export function MainView() {
    const htmlCode = useSelector(ofCurrentView('body', []));

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
        return <Box sx={{ alignItems: 'center', display: 'flex', height: '100%', position: 'absolute', top: 0 }}>
            <CircularProgress/>
        </Box>
    }

    if (showProgressDialog) {
        return <ProgressDialog/>
    }

    return <>
        <PuzzlerRendered/>
        <Choices/>
        <Box>
            <CodePaper body={{
                code: htmlCode,
            }} />
        </Box>
        <Footer/>
        {
            firstStatus &&
            <FeedbackToast correct={ firstStatus === 'firstCorrect' }/>
        }
    </>
}