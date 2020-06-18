import { Region } from '../model/region';
import {
    displayAnswer,
    displayNewPuzzler, navNextPuzzler, navPrevPuzzler, setFooterBtnHeight,
    setTopics,
} from './actions';
import { Topic } from '../model/gen/topic';
import { stream } from '../stream/stream';
import { configureStore, createReducer, combineReducers } from '@reduxjs/toolkit';


export type State = {
    topics: Topic[],
    puzzlerViews: {
        source: string,
        styleChoices: Region[][][],
        commonStyleSummary: string,
        commonStyle: Region[][],
        body: Region[][],
        status: {
            correctChoice: number,
            userChoice: number | undefined,
        }
    }[],
    current: number,
    correctAnswers: number,
    footerBtnHeight: number | null,
}

export function ofCurrentView<T>(map: (view: State['puzzlerViews'][number] | undefined) => T): (state: State) => T {
    return state => map(state.puzzlerViews[state.current]);
}

export const initialState: State = {
    topics: [],
    puzzlerViews: [],
    current: -1,
    correctAnswers: 0,
    footerBtnHeight: null,
};

declare module 'react-redux' {
    // noinspection JSUnusedGlobalSymbols
    interface DefaultRootState extends State {
    }
}

const reducer = combineReducers<State>({
    topics: createReducer(initialState.topics, builder =>
        builder
            .addCase(setTopics, (state, { payload }) => payload)
    ),

    puzzlerViews: createReducer(initialState.puzzlerViews, builder =>
        builder
            .addCase(displayNewPuzzler, (state, { payload }) => [...state, payload])
            .addCase(displayAnswer, (state, { payload }) => {
                stream(state).last().get().status.userChoice = payload.userChoice;
                return state;
            })
    ),

    current: createReducer(initialState.current, builder =>
        builder
            .addCase(displayNewPuzzler, state => state + 1)
            .addCase(navNextPuzzler, state => state + 1)
            .addCase(navPrevPuzzler, state => state -1)
    ),

    correctAnswers: createReducer(initialState.correctAnswers, builder =>
        builder
            .addCase(displayAnswer, (state, { payload }) => state + (payload.isCorrect && 1 || 0))
    ),

    footerBtnHeight: createReducer(initialState.footerBtnHeight, builder =>
        builder
            .addCase(setFooterBtnHeight, (state, { payload }) => payload)
    ),
});

export function createAppStore(preloadedState: State) {
    return configureStore({
        reducer,
        preloadedState,
    })
}
