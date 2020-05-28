import { Region } from '../model/region';
import { Vector } from 'prelude-ts';
import { Topic } from '../model/gen/topic';
import { actionCreator } from './actionUtils';

export const setTopics = actionCreator('setTopics', (
    topics: Vector<Topic>,
) => ({topics}));

export const displayNewPuzzler = actionCreator('displayNewPuzzler', (
    source: string,
    choiceCodes: Vector<Vector<Region[]>>,
    correctChoice: number,
) => ({source, choiceCodes, correctChoice}));

export const displayAnswer = actionCreator('displayAnswer', (
    userChoice: number,
    isCorrect: boolean,
) => ({userChoice, isCorrect})); 

export const navNextPuzzler = actionCreator('navNextPuzzler', () => ({}));

export const navPrevPuzzler = actionCreator('navPrevPuzzler', () => ({}));
