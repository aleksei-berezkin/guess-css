import { green } from '@mui/material/colors';
import { red } from '@mui/material/colors';
import { PuzzlerView } from '../store/State';
    
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

export const choiceBgColor = {
    userCorrect: {
        light: green['A100'],
        dark: '#008008',
    },
    correct: {
        light: green[100],
        dark: green[800],
    },
    incorrect: {
        light: red[100],
        dark: red[800],
    },
    untouched: {light: undefined, dark: undefined},
    notAnswered: {light: undefined, dark: undefined},
}
