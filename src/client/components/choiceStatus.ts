export type ChoiceStatus = 'userCorrect' | 'correct' | 'incorrect' | 'untouched' | 'notAnswered';

export function getChoiceStatus(i: number, correctChoice: number | undefined, userChoice: number | undefined): ChoiceStatus {
    if (userChoice == null) {
        return 'notAnswered';
    }
    if (i === correctChoice) {
        if (userChoice === correctChoice) {
            return 'userCorrect' as const;
        }
        return 'correct';
    }
    if (i === userChoice && userChoice !== correctChoice) {
        return 'incorrect';
    }
    return 'untouched';
}
