import React, { useEffect, useState } from 'react';
import {store, useSelector} from '../store/store';
import ReactGA from 'react-ga';
import { ContentPage } from './contentPage';
import Alert from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import { TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { range, same } from 'fluent-streams';
import { genAndDisplayNewPuzzler } from '../store/thunks';
import { Contacts } from './contacts';

const great = [
    'Great!',
    'Cool!',
    'Awesome!',
    'That\'s a lot!',
];

const usersPercent = [
    'Only 14%',
    'Only 6%',
    'Only 3%',
    'Only 2%',
    'Only 1.5%',
    'Only 1%',
    'Only 1%',
    'Less than 1%',
];

const allCorrect = [
    'Not a single mistake! That\'s indeed impressive!',
    'Wow! All answers are correct! You\'re definitely a CSS pro!',
    'Amazing! Not a single wrong answer! I\'d subscribe to you on Twitter!',
];

const useStyles = makeStyles(theme => ({
    tableCont: {
        marginBottom: theme.spacing(2),
    },
    alert: {
        marginBottom: theme.spacing(2),
    },
}));

export function ProgressDialog() {
    useEffect(() => ReactGA.event({
        category: 'ProgressDialog',
        action: `ProgressDialog_${store.current + 1}`,
    }), []);

    const round = Math.floor(store.current / store.topics.length);
    const [scorePerTopic] = useState(countScorePerTopic);

    const allAnswersAreCorrect = useSelector(state => state.correctAnswers === state.puzzlerViews.length);

    useEffect(() => {
        if (allAnswersAreCorrect) {
            ReactGA.event({
                category: 'AllAnswersAreCorrect',
                action: `AllAnswersAreCorrect_${store.current + 1}`,
            });
        }
    }, []);

    function handleContinue() {
        store.displayProgressDialog(false);
        genAndDisplayNewPuzzler();
        window.scrollTo(0, 0);
    }

    const styles = useStyles();

    return <ContentPage noButtons footer={ round !== 1 }>
        <Typography variant='h5' gutterBottom>You made {store.current + 1} puzzlers!</Typography>

        <Typography variant='body1' paragraph>
            {great[round % (great.length - 1)]} {' '}
            {usersPercent[Math.min(round, usersPercent.length - 1)]} of users get there. Here's your current score per each topic:
        </Typography>

        <TableContainer className={ styles.tableCont }>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell>Topic</TableCell>
                        <TableCell>Score</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        scorePerTopic.map(([t, sc]) =>
                            <TableRow key={ t }>
                                <TableCell><Typography variant='body1'>{ t }</Typography></TableCell>
                                <TableCell>
                                    {
                                        range(0, sc.correct).map(i => <CheckIcon key={ i } fontSize='small'/>).toArray()
                                    }
                                    {
                                        range(0, sc.wrong).map(i => <CloseIcon key={ i } fontSize='small'/>).toArray()
                                    }
                                </TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>

        {
            allAnswersAreCorrect &&
            <Alert severity='success' className={ styles.alert }>
                <Typography variant='body1'>{ allCorrect[round % allCorrect.length] }</Typography>
            </Alert>
        }

        {
            round === 1 &&
            <>
                <Typography variant='body1' paragraph>
                    Seems you liked this toy, so I bet you have some feedback. If that's the case please feel free to share it:
                </Typography>
                <Contacts paragraph/>
            </>
        }

        {
            round === 2 &&
            <>
                <Typography variant='body1' paragraph>
                    If you were looking for the game to end it's a good moment perhaps. Thanks for your interest! And, once again, please feel free to share any feedback.
                </Typography>
                <Typography variant='body1' paragraph>
                    You may also continue playing if you wish; the game is technically endless. We'll continue to make pauses after each {store.topics.length} puzzlers to track your results.
                </Typography>
            </>
        }

        {
            round !== 2 &&
            <Typography variant='body1' paragraph>
                We'll meet again after next {store.topics.length} puzzlers to check your results. See you later!
            </Typography>
        }

        <Button color='primary' fullWidth variant='outlined' onClick={ handleContinue }>Continue</Button>
    </ContentPage>;
}

function countScorePerTopic() {
    return same(store.topics)
        .flatMap(topics => topics)
        .zip(store.puzzlerViews)
        .groupBy(([t]) => t)
        .map(([t, tAndVs]) => [
            t,
            tAndVs
                .map(([_, {status}]) => status.userChoice === status.correctChoice)
                .reduce((acc, isCorrect) => {
                    if (isCorrect) {
                        acc.correct++;
                    } else {
                        acc.wrong++;
                    }
                    return acc;
                }, {correct: 0 as number, wrong: 0 as number}),
        ] as const)
        .sortBy(([_, score]) => score.wrong)
        .toArray();
}
