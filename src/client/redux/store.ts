import { ChoiceCode } from '../../shared/api';
import { DisplayAnswer, DisplayPuzzler, isOfType, NavNextPuzzler, NavPrevPuzzler, Type } from './actions';
import { Action, applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './saga';
import { Vector } from 'prelude-ts';


export interface State {
    // head is the most recent, tail is history
    puzzlers: Vector<PuzzlerFull>,
    current: number,
    correctAnswers: number,
}

export interface PuzzlerFull {
    id: string,
    token: string,
    choiceCodes: ChoiceCode[],
    answer: Answer | undefined,
}

export interface Answer {
    userChoice: number,
    correctChoice: number,
}

export const initialState: State = {
    puzzlers: Vector.empty(),
    current: -1,
    correctAnswers: 0,
};

const rootReducer = combineReducers({
    puzzlers: function(puzzlers: Vector<PuzzlerFull> = initialState.puzzlers, action: Action): Vector<PuzzlerFull> {
        if (isOfType<DisplayPuzzler>(Type.DISPLAY_PUZZLER, action)) {
            return Vector.of<PuzzlerFull>(
                {
                    id: action.puzzlerId,
                    token: action.token,
                    choiceCodes: action.choiceCodes,
                    answer: undefined,
                }
            ).appendAll(puzzlers);
        }

        if (isOfType<DisplayAnswer>(Type.DISPLAY_ANSWER, action)) {
            const [puzzler, i] = puzzlers.zipWithIndex()
                .find(([p, _]) => p.id === action.puzzlerId)
                .getOrThrow();
            const updatedPuzzler = {
                ...puzzler,
                answer: {
                    userChoice: action.userChoice,
                    correctChoice: action.correctChoice,
                }
            };
            return puzzlers.replace(i, updatedPuzzler);
        }

        return puzzlers;
    },

    current: function(current: number = initialState.current, action: Action): number {
        if (isOfType<DisplayPuzzler>(Type.DISPLAY_PUZZLER, action)) {
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
        if (isOfType<DisplayAnswer>(Type.DISPLAY_ANSWER, action) && action.userChoice === action.correctChoice) {
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
