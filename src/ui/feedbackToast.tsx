import Slide, { SlideProps } from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { randomItem } from '../util/randomItem';

const correct = [
    {
        title: 'Exactly!',
        info: 'This CSS indeed renders the frame!',
    },
    {
        title: 'Excellent!',
        info: 'You chose correct snippet!'
    },
    {
        title: 'Perfect!',
        info: 'That\'s absolutely correct answer!'
    },
];

const wrong = [
    {
        title: 'Sure, you\'ve been very close',
        info: 'Let\'s try next puzzle!',
    },
    {
        title: 'Agreed, it\'s very close to correct',
        info: 'Next time you\'ll be more lucky!',
    },
    {
        title: 'Yep, that\'s almost correct',
        info: 'How about trying next puzzle?',
    },
];

export function FeedbackToast(p: {correct: boolean}) {
    const [open, setOpen] = useState(true);
    const [texts] = useState(randomItem(p.correct ? correct : wrong));

    function hide() {
        setOpen(false);
    }

    return <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        onClose={ hide }
        open={ open }
        TransitionComponent={ SlideTransition }
    >
        <Alert severity={p.correct ? 'success' : 'info'} variant='filled'>
            <AlertTitle>{ texts.title }</AlertTitle>
            { texts.info }
        </Alert>
    </Snackbar>;
}

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction='up'/>
}
