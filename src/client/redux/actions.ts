import { Vector } from 'prelude-ts';
import { Topic } from '../model/gen/topic';
import { actionCreator } from './actionUtils';
import { Puzzler } from '../model/puzzler';
import { State } from './store';
import { InferVectorType } from '../util';

export const setTopics = actionCreator('setTopics', (
    topics: Vector<Topic>,
) => ({topics}));

export const displayNewPuzzler = actionCreator('displayNewPuzzler', (puzzler: Puzzler, diffHint: boolean): { puzzlerView: InferVectorType<State['puzzlerViews']> } => ({
    puzzlerView: {
        source: puzzler.html,
        styleCodes: puzzler.getStyleCodes(diffHint),
        bodyInnerCode: puzzler.getBodyCode(),
        correctChoice: puzzler.correctChoice,
        userChoice: undefined,
    }
}));

export const displayAnswer = actionCreator('displayAnswer', (
    userChoice: number,
    isCorrect: boolean,
) => ({userChoice, isCorrect})); 

export const navNextPuzzler = actionCreator('navNextPuzzler', () => ({}));

export const navPrevPuzzler = actionCreator('navPrevPuzzler', () => ({}));
