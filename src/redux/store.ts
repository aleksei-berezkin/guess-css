import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { correctAnswers } from './slices/correctAnswers';
import { current } from './slices/current';
import { topics } from './slices/topics';
import { PuzzlerView, puzzlerViews } from './slices/puzzlerViews';
import { layoutConstants } from './slices/layoutConstants';

export const reducer = combineReducers({
    topics: topics.reducer,
    puzzlerViews: puzzlerViews.reducer,
    current: current.reducer,
    correctAnswers: correctAnswers.reducer,
    layoutConstants: layoutConstants.reducer,
});

export type State = ReturnType<typeof reducer>;

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

declare module 'react-redux' {
    // noinspection JSUnusedGlobalSymbols
    interface DefaultRootState extends State {
    }
}

export function createAppStore() {
    return configureStore({reducer});
}
