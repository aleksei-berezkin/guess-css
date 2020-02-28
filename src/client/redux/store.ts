import { ChoiceCode } from '../../shared/api';
import { Action, DisplayAnswer, DisplayChoice, DisplayPuzzler, Type } from './actions';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './saga';
import * as R from 'ramda';


export interface State {
    // head is the most recent, tail is history
    puzzlers: PuzzlerFull[],
    current: number,
    score: Score,
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

export interface Score {
    correct: number,
    total: number,
}

const initialState: State = {
    puzzlers: [],
    current: -1,
    score: {
        correct: 0,
        total: 0,
    },
};

const rootReducer = combineReducers({
    puzzlers: function(puzzlers: PuzzlerFull[] = initialState.puzzlers, action: Action): PuzzlerFull[] {
        if (action.type === Type.DISPLAY_PUZZLER) {
            const a: DisplayPuzzler = action as DisplayPuzzler;
            return [
                {
                    id: a.puzzler.id,
                    token: a.puzzler.token,
                    choiceCodes: R.repeat([], a.puzzler.choicesCount),
                    answer: null,
                },
                ...puzzlers,
            ]
        }

        if (action.type === Type.DISPLAY_CHOICE) {
            const a: DisplayChoice = action as DisplayChoice;
            const i = R.findIndex(p => p.id === a.puzzlerId, puzzlers);
            return insert(puzzlers, i,
                {
                    ...puzzlers[i],
                    choiceCodes: insert(puzzlers[i].choiceCodes, a.choice, a.code),
                }
            );
        }

        if (action.type === Type.DISPLAY_ANSWER) {
            const a: DisplayAnswer = action as DisplayAnswer;
            const i = R.findIndex(p => p.id === a.puzzlerId, puzzlers);
            return insert(puzzlers, i,
                {
                    ...puzzlers[i],
                    answer: {
                        userChoice: a.userChoice,
                        correctChoice: a.correctChoice,
                    }
                }
            );
        }

        return puzzlers;
    },

    current: function(current: number = initialState.current, action: Action): number {
        if (action.type === Type.DISPLAY_PUZZLER && current === -1) {
            return 0;
        }
        return current;
    },

    score: function(score: Score = initialState.score, action: Action): Score {
        if (action.type === Type.DISPLAY_ANSWER) {
            const {userChoice, correctChoice} = action as DisplayAnswer;
            return {
                correct: (userChoice === correctChoice) ? score.correct + 1 : score.correct,
                total: score.total + 1,
            }
        }

        return score;
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
