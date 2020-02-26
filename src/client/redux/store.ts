import { GenPuzzlerResponse, Region } from '../../shared/api';
import { Action, DisplayAnswer, DisplayChoice, DisplayPuzzler, Type } from './actions';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './saga';


export interface State {
    puzzler: GenPuzzlerResponse | null,
    choiceCodes: (ChoiceCode | null)[],
    answer: Answer | null,
}

export interface ChoiceCode {
    puzzlerId: string,
    code: Region[][],
}

export interface Answer {
    puzzlerId: string,
    userChoice: number,
    correctChoice: number,
}

const initialState: State = {
    puzzler: null,
    choiceCodes: [],
    answer: null,
};

const rootReducer = combineReducers({
    puzzler: function(puzzler: GenPuzzlerResponse | null = initialState.puzzler, action: Action) {
        if (action.type === Type.DISPLAY_PUZZLER) {
            return (action as DisplayPuzzler).puzzler;
        }
        return puzzler;
    },

    choiceCodes: function(choiceCodes: (ChoiceCode | null)[] = initialState.choiceCodes, action: Action) {
        if (action.type === Type.DISPLAY_PUZZLER) {
            const {puzzler} = action as DisplayPuzzler;
            if (choiceCodes.length > puzzler.choicesCount) {
                return choiceCodes.slice(0, puzzler.choicesCount);
            }
            return choiceCodes;
        }

        if (action.type === Type.DISPLAY_CHOICE) {
            const {puzzlerId, choice, code} = action as DisplayChoice;
            return insert(choiceCodes, choice, {puzzlerId, code});
        }

        return choiceCodes;
    },

    answer: function(answer: Answer | null = initialState.answer, action: Action) {
        if (action.type === Type.DISPLAY_PUZZLER) {
            return null;
        }

        if (action.type === Type.DISPLAY_ANSWER) {
            const {puzzlerId, userChoice, correctChoice} = action as DisplayAnswer;
            return {puzzlerId, userChoice, correctChoice};
        }

        return answer;
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
