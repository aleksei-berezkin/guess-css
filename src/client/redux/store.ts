import { ChoiceCode } from '../../shared/api';
import { DisplayAnswer, DisplayPuzzler, typedOrUndefined, Type } from './actions';
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
        const displayPuzzler = typedOrUndefined<DisplayPuzzler>(Type.DISPLAY_PUZZLER, action);
        if (displayPuzzler) {
            return Vector.of<PuzzlerFull>(
                {
                    id: displayPuzzler.puzzlerId,
                    token: displayPuzzler.token,
                    choiceCodes: displayPuzzler.choiceCodes,
                    answer: undefined,
                }
            ).appendAll(puzzlers);
        }

        const displayAnswer = typedOrUndefined<DisplayAnswer>(Type.DISPLAY_ANSWER, action);
        if (displayAnswer) {
            const [puzzler, i] = puzzlers.zipWithIndex()
                .find(([p, _]) => p.id === displayAnswer.puzzlerId)
                .getOrThrow();
            const updatedPuzzler = {
                ...puzzler,
                answer: {
                    userChoice: displayAnswer.userChoice,
                    correctChoice: displayAnswer.correctChoice,
                }
            };
            return puzzlers.replace(i, updatedPuzzler);
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
        const displayAnswer = typedOrUndefined<DisplayAnswer>(Type.DISPLAY_ANSWER, action);
        if (displayAnswer && displayAnswer.userChoice === displayAnswer.correctChoice) {
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
