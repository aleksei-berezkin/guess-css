import { PuzzlerView } from '../redux/store';
import makeStyles from '@material-ui/core/styles/makeStyles';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import { CSSProperties } from '@material-ui/styles/withStyles/withStyles';
import { DefaultTheme } from '@material-ui/styles';

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

const choiceStylesObj: {[status in ChoiceStatus]: CSSProperties} = {
    userCorrect: {
        backgroundColor: green['A100'],
    },
    correct: {
        backgroundColor: green[100],
    },
    incorrect: {
        backgroundColor: red[100] ,
    },
    untouched: {},
    notAnswered: {},
}

export const useChoiceStyles = makeStyles<DefaultTheme, ChoiceStatus>(choiceStylesObj);
