import { Region } from '../model/region';
import {
    displayAnswer,
    displayNewPuzzler, navNextPuzzler, navPrevPuzzler, setFooterBtnHeight,
    setTopics,
} from './actions';
import { Action, applyMiddleware, combineReducers, createStore } from 'redux';
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk';
import { Topic } from '../model/gen/topic';
import { isAction } from './actionUtils';
import { stream } from '../stream/stream';


export type State = {
    topics: Topic[],
    puzzlerViews: {
        source: string,
        styleChoices: Region[][][],
        commonStyleSummary: string,
        commonStyle: Region[][],
        body: Region[][],
        correctChoice: number,
        userChoice: number | undefined,
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

const rootReducer = combineReducers({
    topics: function(state: State['topics'] = initialState.topics, action: Action): State['topics'] {
        if (isAction(setTopics, action)) {
            return action.topics;
        }
        return state;
    },

    puzzlerViews: function(state: State['puzzlerViews'] = initialState.puzzlerViews, action: Action): State['puzzlerViews'] {
        if (isAction(displayNewPuzzler, action)) {
            return [...state, action.puzzlerView];
        }

        if (isAction(displayAnswer, action)) {
            return [
                ...stream(state).butLast(),
                {
                    ...stream(state).last().get(),
                    userChoice: action.userChoice,
                }
            ]
        }

        return state;
    },

    current: function(state: State['current'] = initialState.current, action: Action): State['current'] {
        if (isAction(displayNewPuzzler, action) || isAction(navNextPuzzler, action)) {
            return state + 1;
        }

        if (isAction(navPrevPuzzler, action)) {
            return state - 1;
        }

        return state;
    },

    correctAnswers: function(state: State['correctAnswers'] = initialState.correctAnswers, action: Action): State['correctAnswers'] {
        if (isAction(displayAnswer, action) && action.isCorrect) {
            return state + 1;
        }

        return state;
    },

    footerBtnHeight: function(state: State['footerBtnHeight'] = initialState.footerBtnHeight, action: Action): State['footerBtnHeight'] {
        if (isAction(setFooterBtnHeight, action)) {
            return action.height;
        }

        return state;
    }
});

export function createAppStore(state: State) {
    return createAppStoreWithMiddleware(state, thunkMiddleware);
}

export function createAppStoreWithMiddleware(state: State, middleware?: ThunkMiddleware) {
    return createStore(
        rootReducer,
        state,
        middleware && applyMiddleware(middleware),
    );
}
