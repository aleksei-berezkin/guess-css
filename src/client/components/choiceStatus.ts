import { State } from '../redux/store';

export type ChoiceStatus = 'userCorrect' | 'correct' | 'incorrect' | 'untouched' | 'notAnswered';

export function getChoiceStatus(i: number, status: State['puzzlerViews'][number]['status'] | undefined): ChoiceStatus {
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
