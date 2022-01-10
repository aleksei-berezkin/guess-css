import { Slide, Snackbar } from '@material-ui/core';
import React, { useState } from 'react';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import {stream} from "fluent-streams";

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
    const [texts] = useState(stream(p.correct ? correct : wrong).randomItem().get());

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

function SlideTransition(props: unknown) {
    return <Slide {...props} direction='up'/>
}
