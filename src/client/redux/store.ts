import { Region } from '../model/region';
import {
    displayAnswer,
    displayNewPuzzler, navNextPuzzler, navPrevPuzzler, resetSsrData, setCurrentTab, setFooterBtnHeight,
    setTopics,
} from './actions';
import { Topic } from '../model/gen/topic';
import { stream } from '../stream/stream';
import { configureStore, createReducer, combineReducers } from '@reduxjs/toolkit';
import { ResolvedColor } from './resolvedColor';
import { ResolvedContrastColor } from './resolvedContrastColor';


export type State = {
    topics: Topic[],
    puzzlerViews: {
        source: string,
        styleChoices: Region[][][],
        commonStyleSummary: string,
        commonStyle: Region[][],
        resolvedPlaceholders: {
            contrastColor: ResolvedContrastColor,
            colors: ResolvedColor[],
        },
        body: Region[][],
        status: {
            correctChoice: number,
            userChoice: number | undefined,
        },
        currentTab: number,
    }[],
    current: number,
    correctAnswers: number,
    footerBtnHeight: number | null,
    ssr: {
        wide: boolean,
    } | null;
}

export type PuzzlerView = State['puzzlerViews'][number];

export function ofCurrentView<K extends keyof PuzzlerView>(key: K, deflt: PuzzlerView[K]): (state: State) => PuzzlerView[K] {
    return mapCurrentView(v => v && v[key], deflt);
}
export function ofCurrentViewOrUndefined<K extends keyof PuzzlerView>(key: K): (state: State) => (PuzzlerView[K] | undefined) {
    return mapCurrentView(v => v && v[key], undefined);
}

export function mapCurrentView<T>(map: (v: PuzzlerView) => T, deflt: T): (state: State) => T {
    return state => {
        const currentView = state.puzzlerViews[state.current];
        return currentView && map(currentView) || deflt;
    };
}


export const initialState: State = {
    topics: [],
    puzzlerViews: [],
    current: -1,
    correctAnswers: 0,
    footerBtnHeight: null,
    ssr: null,
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
            .addCase(setCurrentTab, (state, { payload }) => {
                state[payload.currentPuzzler].currentTab = payload.currentTab;
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

    ssr: createReducer(initialState.ssr, builder =>
        builder
            .addCase(resetSsrData, _ => null)
    )
});

export function createAppStore(preloadedState: State) {
    return configureStore({
        reducer,
        preloadedState,
    })
}
