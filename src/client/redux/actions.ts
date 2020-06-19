import { Topic } from '../model/gen/topic';
import { createAction } from '@reduxjs/toolkit';
import { noPayload, withPayload } from './payloadUtils';
import { State } from './store';

export const setTopics = createAction('setTopics', withPayload<Topic[]>());

export const displayNewPuzzler = createAction('displayNewPuzzler', withPayload<State['puzzlerViews'][number]>());

export const displayAnswer = createAction('displayAnswer', withPayload<{
    userChoice: number,
    isCorrect: boolean,
}>()); 

export const navNextPuzzler = createAction('navNextPuzzler', noPayload);

export const navPrevPuzzler = createAction('navPrevPuzzler', noPayload);

export const setFooterBtnHeight = createAction('setFooterBtnHeight', withPayload<number>());

export const setCurrentTab = createAction('setCurrentTab', withPayload<{
    currentPuzzler: number,
    currentTab: number
}>());
