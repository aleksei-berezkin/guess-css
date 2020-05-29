import { Region } from '../model/region';
import {
    displayAnswer,
    displayNewPuzzler, navNextPuzzler, navPrevPuzzler,
    setTopics,
} from './actions';
import { Action, applyMiddleware, combineReducers, createStore } from 'redux';
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk';
import { Vector } from 'prelude-ts';
import { Topic } from '../model/gen/topic';
import { isAction } from './actionUtils';


export type State = {
    topics: Vector<Topic>,
    puzzlerViews: Vector<{
        source: string,
        choiceCodes: Vector<Vector<Region[]>>,
        styleCodes: Vector<Vector<Region[]>>,
        bodyInnerCode: Vector<Region[]>,
        correctChoice: number,
        userChoice: number | undefined,
    }>,
    current: number,
    correctAnswers: number,
}

export const initialState: State = {
    topics: Vector.empty(),
    puzzlerViews: Vector.empty(),
    current: -1,
    correctAnswers: 0,
};

const rootReducer = combineReducers({
    topics: function(state: State['topics'] = initialState.topics, action: Action): State['topics'] {
        if (isAction(setTopics, action)) {
            return action.topics;
        }
        return state;
    },

    puzzlerViews: function(state: State['puzzlerViews'] = initialState.puzzlerViews, action: Action): State['puzzlerViews'] {
        if (isAction(displayNewPuzzler, action)) {
            return state.append({
                source: action.source,
                choiceCodes: action.choiceCodes,
                styleCodes: action.styleCodes,
                bodyInnerCode: action.bodyInnerCode,
                correctChoice: action.correctChoice,
                userChoice: undefined as number | undefined,
            });
        }

        if (isAction(displayAnswer, action)) {
            return state.init()
                .append({
                    ...state.last().getOrThrow(),
                    userChoice: action.userChoice,
                });
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
