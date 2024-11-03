import { green } from '@mui/material/colors';
import { red } from '@mui/material/colors';
import { PuzzlerView } from '../store/State';
import makeStyles from '@mui/styles/makeStyles';

export type ChoiceStatus = 'userCorrect' | 'correct' | 'incorrect' | 'untouched' | 'notAnswered';

export function getChoiceStatus(i: number, status: PuzzlerView['status'] | undefined): ChoiceStatus {
    if (status?.userChoice == null) {
        return 'notAnswered';
    }
    if (i === status.correctChoice) {
        if (status.userChoice === status.correctChoice) {
            return 'userCorrect' as const;
        }
        return 'correct';
    }
    if (i === status.userChoice && status.userChoice !== status.correctChoice) {
        return 'incorrect';
    }
    return 'untouched';
}

const choiceStylesObj = {
    userCorrect: {
        light: {
            backgroundColor: green['A100'],
        },
        dark: {
            backgroundColor: '#008008',
        },
    },
    correct: {
        light: {
            backgroundColor: green[100],
        },
        dark: {
            backgroundColor: green[800],
        },
    },
    incorrect: {
        light: {
            backgroundColor: red[100] ,
        },
        dark: {
            backgroundColor: red[800],
        },
    },
    untouched: {light: {}, dark: {}},
    notAnswered: {light: {}, dark: {}},
}

export const makeChoiceStyles = makeStyles(
    theme =>
        Object.fromEntries(
            Object.entries(choiceStylesObj)
                .map(([k, v]) => [k, v[theme.palette.mode]] as const)
        )
);
