import { PuzzlerView } from '../redux/store';
import makeStyles from '@material-ui/core/styles/makeStyles';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import { CSSProperties } from '@material-ui/styles/withStyles/withStyles';
import { PaletteType } from '@material-ui/core';
import { entriesStream } from '../stream/stream';

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

const choiceStylesObj: {
    [status in ChoiceStatus]: {
        [paletteType in PaletteType]: CSSProperties
    }
} = {
    userCorrect: {
        light: {
            backgroundColor: green['A100'],
        },
        dark: {
            backgroundColor: green['A700'],
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
    (theme): {[status in ChoiceStatus]: CSSProperties} =>
        entriesStream(choiceStylesObj)
            .map(([k, v]) => [k, v[theme.palette.type]] as const)
            .toObject()
);
