import { Region } from '../model/region';
import { Vector } from 'prelude-ts';
import { Topic } from '../model/gen/topic';
import { actionCreator } from './actionUtils';
import { Puzzler } from '../model/puzzler';

export const setTopics = actionCreator('setTopics', (
    topics: Vector<Topic>,
) => ({topics}));

export const displayNewPuzzler = actionCreator('displayNewPuzzler', (puzzler: Puzzler, diffHint: boolean) => ({
    source: puzzler.html,
    choiceCodes: puzzler.getChoiceCodes(diffHint),
    styleCodes: puzzler.getStyleCodes(diffHint),
    bodyInnerCode: puzzler.getBodyInnerCode(),
    correctChoice: puzzler.correctChoice,
}));

export const displayAnswer = actionCreator('displayAnswer', (
    userChoice: number,
    isCorrect: boolean,
) => ({userChoice, isCorrect})); 

export const navNextPuzzler = actionCreator('navNextPuzzler', () => ({}));

export const navPrevPuzzler = actionCreator('navPrevPuzzler', () => ({}));
