import { useEffect, useState } from 'react';
import { store, useSelector } from './store/store';
import { ContentPage } from './contentPage';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import { TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'; // TODO default import
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Button from "@mui/material/Button";
import { genAndDisplayNewPuzzler } from './store/thunks';
import { Contacts } from './contacts';
import { leadingZeros3 } from './util/leadingZeros3';
import { countScorePerTopic } from './scorePerTopic';
import { gaEvent } from './ga';

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
    'Not a single mistake! That\'s truly impressive!',
    'Wow! All answers are correct! You\'re definitely a CSS pro!',
    'Amazing! Not a single wrong answer — I\'d follow you on Twitter!',
    'Flawless! You nailed every single answer — CSS mastery unlocked!',
    'Perfect score! Your CSS skills are on point — keep up the amazing work!'
];

const  moreCorrect = [
    'Nice! Most of your answers are correct!',
    'Good job! You answered mostly correctly!',
    'Well done! Most of your answers are spot on!',
    'Almost perfect! You got most of them right — keep going!',
    'Great effort! You\'re almost there with mostly correct answers!',
];

export function ProgressDialog() {
    useEffect(() => gaEvent('ProgressDialog', leadingZeros3(store.current + 1)), []);

    const round = Math.floor(store.current / store.persistent.topics.length);
    const [scorePerTopic] = useState(countScorePerTopic);

    const allAnswersAreCorrect = useSelector(state => state.persistent.correctAnswers === state.persistent.puzzlerViews.length);
    const moreCorrectAnswers = useSelector(state => state.persistent.correctAnswers > state.persistent.puzzlerViews.length / 2);

    useEffect(() => {
        if (allAnswersAreCorrect) {
            gaEvent('AllAnswersAreCorrect', leadingZeros3(store.current + 1));
        } else if (moreCorrectAnswers) {
            gaEvent('MoreCorrectAnswers', leadingZeros3(store.current + 1));
        }
    }, []);

    function handleContinue() {
        genAndDisplayNewPuzzler();
        window.scrollTo(0, 0);
    }

    return <ContentPage noButtons footer={ round !== 1 }>
        <Typography variant='h5' gutterBottom>You made {store.current + 1} puzzlers!</Typography>

        <Typography variant='body1' paragraph>
            {great[round % (great.length - 1)]} {' '}
            {usersPercent[Math.min(round, usersPercent.length - 1)]} of users get there. Here&apos;s your current score per each topic:
        </Typography>

        <TableContainer sx={{ mb: 2 }}>
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
                                        Array.from({length: sc.correct}).map((_, i) => <CheckIcon key={ i } fontSize='small'/>)
                                    }
                                    {
                                        Array.from({length: sc.wrong}).map((_, i) => <CloseIcon key={ i } fontSize='small'/>)
                                    }
                                </TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>

        {
            (allAnswersAreCorrect || moreCorrectAnswers) &&
            <Alert severity='success' sx={{ mb: 2 }}>
                <Typography variant='body1'>{ (allAnswersAreCorrect ? allCorrect : moreCorrect)[round % allCorrect.length] }</Typography>
            </Alert>
        }

        {
            round === 1 &&
            <>
                <Typography variant='body1' paragraph>
                    It seems you enjoyed this little game. If you have any feedback, I&apos; love to hear it:
                </Typography>
                <Contacts paragraph/>
            </>
        }

        {
            round === 2 &&
            <>
                <Typography variant='body1' paragraph>
                    If you were waiting for a good stopping point, now might be a perfect time. Thanks for playing! And once again, feel free to share any feedback.
                </Typography>
                <Typography variant='body1' paragraph>
                    Of course, you can keep playing if you&apos;d like — the game is technically endless. We&apos;ll continue to pause every {store.persistent.topics.length} puzzlers to track your progress.
                </Typography>
            </>
        }

        {
            round !== 2 &&
            <Typography variant='body1' paragraph>
                We&apos;ll check your results again after the next {store.persistent.topics.length} puzzlers. See you soon!
            </Typography>
        }

        <Button color='primary' fullWidth variant='outlined' onClick={ handleContinue }>Continue</Button>
    </ContentPage>;
}

