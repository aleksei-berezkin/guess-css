import { Region } from '../model/region';
import {
    DisplayAnswer,
    DisplayNewPuzzler,
    isOfType,
    NavNextPuzzler,
    NavPrevPuzzler, SetTopics,
    Type
} from './actions';
import { Action, applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './saga';
import { Vector } from 'prelude-ts';
import { Topic } from '../model/gen/topic';


export type State = {
    topics: Vector<Topic>,
    // head is the most recent, tail is history
    puzzlerViews: Vector<PuzzlerView>,
    current: number,
    correctAnswers: number,
}

export type PuzzlerView = {
    source: string,
    choiceCodes: Vector<Vector<Region[]>>,
    correctChoice: number,
    userChoice?: number,
}

export const initialState: State = {
    topics: Vector.empty(),
    puzzlerViews: Vector.empty(),
    current: -1,
    correctAnswers: 0,
};

const rootReducer = combineReducers({
    topics: function(topics: Vector<Topic> = initialState.topics, action: Action): Vector<Topic> {
        if (isOfType<SetTopics>(Type.SET_TOPICS, action)) {
            return action.topics;
        }
        return topics;
    },

    puzzlerViews: function(puzzlerViews: Vector<PuzzlerView> = initialState.puzzlerViews, action: Action): Vector<PuzzlerView> {
        if (isOfType<DisplayNewPuzzler>(Type.DISPLAY_NEW_PUZZLER, action)) {
            return Vector.of<PuzzlerView>(
                {
                    source: action.source,
                    choiceCodes: action.choiceCodes,
                    correctChoice: action.correctChoice,
                }
            ).appendAll(puzzlerViews);
        }

        if (isOfType<DisplayAnswer>(Type.DISPLAY_ANSWER, action)) {
            const headView = puzzlerViews.head().getOrThrow();
            const updatedView: PuzzlerView = {
                ...headView,
                userChoice: action.userChoice,
            };
            return Vector.of(updatedView).appendAll(puzzlerViews.tail().getOrThrow());
        }

        return puzzlerViews;
    },

    current: function(current: number = initialState.current, action: Action): number {
        if (isOfType<DisplayNewPuzzler>(Type.DISPLAY_NEW_PUZZLER, action)) {
            if (current === -1 || current === 0) {
                return 0;
            }
            throw new Error('Current=' + current);
        }

        if (isOfType<NavNextPuzzler>(Type.NAV_NEXT_PUZZLER, action)) {
            if (current > 0) {
                return current - 1;
            }
            throw new Error('Current=' + current);
        }

        if (isOfType<NavPrevPuzzler>(Type.NAV_PREV_PUZZLER, action)) {
            return current + 1;
        }

        return current;
    },

    correctAnswers: function(correctAnswers: number = initialState.correctAnswers, action: Action): number {
        if (isOfType<DisplayAnswer>(Type.DISPLAY_ANSWER, action) && action.isCorrect) {
            return correctAnswers + 1;
        }

        return correctAnswers;
    }
});

export function createAppStore(state: State) {
    const sagaMiddleware = createSagaMiddleware();
    const store = createAppStoreWithMiddleware(state, sagaMiddleware);
    sagaMiddleware.run(rootSaga);
    return store;
}

export function createAppStoreWithMiddleware(state: State, middleware?: any) {
    return createStore(
        rootReducer,
        state,
        middleware && applyMiddleware(middleware),
    );
}
