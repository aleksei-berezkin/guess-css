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
    // head is the most recent, tail is history
    puzzlerViews: Vector<{
        source: string,
        choiceCodes: Vector<Vector<Region[]>>,
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
    topics: function(topics: State['topics'] = initialState.topics, action: Action): State['topics'] {
        if (isAction(setTopics, action)) {
            return action.topics;
        }
        return topics;
    },

    puzzlerViews: function(puzzlerViews: State['puzzlerViews'] = initialState.puzzlerViews, action: Action): State['puzzlerViews'] {
        if (isAction(displayNewPuzzler, action)) {
            return Vector.of(
                {
                    source: action.source,
                    choiceCodes: action.choiceCodes,
                    correctChoice: action.correctChoice,
                    userChoice: undefined as number | undefined,
                }
            ).appendAll(puzzlerViews);
        }

        if (isAction(displayAnswer, action)) {
            const headView = puzzlerViews.head().getOrThrow();
            const updatedView = {
                ...headView,
                userChoice: action.userChoice as number | undefined,
            };
            return Vector.of(updatedView).appendAll(puzzlerViews.tail().getOrThrow());
        }

        return puzzlerViews;
    },

    current: function(current: State['current'] = initialState.current, action: Action): State['current'] {
        if (isAction(displayNewPuzzler, action)) {
            if (current === -1 || current === 0) {
                return 0;
            }
            throw new Error('Current=' + current);
        }

        if (isAction(navNextPuzzler, action)) {
            if (current > 0) {
                return current - 1;
            }
            throw new Error('Current=' + current);
        }

        if (isAction(navPrevPuzzler, action)) {
            return current + 1;
        }

        return current;
    },

    correctAnswers: function(correctAnswers: State['correctAnswers'] = initialState.correctAnswers, action: Action): State['correctAnswers'] {
        if (isAction(displayAnswer, action) && action.isCorrect) {
            return correctAnswers + 1;
        }

        return correctAnswers;
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
