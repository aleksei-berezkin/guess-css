import { ChoiceCode } from '../../shared/api';
import { Action, DisplayAnswer, DisplayPuzzler, Type } from './actions';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './saga';
import * as R from 'ramda';


export interface State {
    // head is the most recent, tail is history
    puzzlers: PuzzlerFull[],
    current: number,
    correctAnswers: number,
}

export interface PuzzlerFull {
    id: string,
    token: string,
    choiceCodes: ChoiceCode[],
    answer: Answer | null,
}

export interface Answer {
    userChoice: number,
    correctChoice: number,
}

const initialState: State = {
    puzzlers: [],
    current: -1,
    correctAnswers: 0,
};

const rootReducer = combineReducers({
    puzzlers: function(puzzlers: PuzzlerFull[] = initialState.puzzlers, action: Action): PuzzlerFull[] {
        if (action.type === Type.DISPLAY_PUZZLER) {
            const {puzzlerId, token, choiceCodes} = action as DisplayPuzzler;
            return [
                {
                    id: puzzlerId,
                    token,
                    choiceCodes,
                    answer: null,
                },
                ...puzzlers,
            ]
        }

        if (action.type === Type.DISPLAY_ANSWER) {
            const {puzzlerId, userChoice, correctChoice} = action as DisplayAnswer;
            const i = R.findIndex(p => p.id === puzzlerId, puzzlers);
            return insert(puzzlers, i,
                {
                    ...puzzlers[i],
                    answer: {
                        userChoice,
                        correctChoice,
                    }
                }
            );
        }

        return puzzlers;
    },

    current: function(current: number = initialState.current, action: Action): number {
        if (action.type === Type.DISPLAY_PUZZLER) {
            if (current === -1 || current === 0) {
                return 0;
            }
            throw new Error('Current=' + current);
        }

        if (action.type === Type.NAV_NEXT_PUZZLER) {
            if (current > 0) {
                return current - 1;
            }
            throw new Error('Current=' + current);
        }

        if (action.type === Type.NAV_PREV_PUZZLER) {
            return current + 1;
        }

        return current;
    },

    correctAnswers: function(correctAnswers: number = initialState.correctAnswers, action: Action): number {
        if (action.type === Type.DISPLAY_ANSWER) {
            const {userChoice, correctChoice} = action as DisplayAnswer;
            if (userChoice === correctChoice) {
                return correctAnswers + 1;
            }
        }

        return correctAnswers;
    }
});

function insert<T>(a: T[], i: number, val: T): T[] {
    const b = [...a];
    b[i] = val;
    return b;
}

export function createAppStore() {
    const sagaMiddleware = createSagaMiddleware();

    const store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(sagaMiddleware),
    );

    sagaMiddleware.run(rootSaga);

    return store;
}
