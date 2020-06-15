import { Topic } from '../model/gen/topic';
import { Puzzler } from '../model/puzzler';
import { createAction } from '@reduxjs/toolkit';
import { noPayload, withPayload } from './payloadUtils';

export const setTopics = createAction('setTopics', withPayload<Topic[]>());

export const displayNewPuzzler = createAction('displayNewPuzzler', withPayload<{
    puzzler: Puzzler,
    diffHint: boolean
}>());

export const displayAnswer = createAction('displayAnswer', withPayload<{
    userChoice: number,
    isCorrect: boolean,
}>()); 

export const navNextPuzzler = createAction('navNextPuzzler', noPayload);

export const navPrevPuzzler = createAction('navPrevPuzzler', noPayload);

export const setFooterBtnHeight = createAction('setFooterBtnHeight', withPayload<number>());
