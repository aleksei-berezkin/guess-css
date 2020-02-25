import { ChoiceFormatted, GenPuzzlerResponse } from '../../shared/api';
import { Action, DisplayChoice, DisplayPuzzler, Type } from './actions';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './saga';
import * as R from 'ramda';


export interface State {
    puzzler: GenPuzzlerResponse | null,
    choices: (ChoiceFormatted | null)[],
}

const initialState: State = {
    puzzler: null,
    choices: [],
};

const rootReducer = combineReducers({
    puzzler: function(puzzler: GenPuzzlerResponse | null = initialState.puzzler, action: Action) {
        if (action.type === Type.DISPLAY_PUZZLER) {
            return (action as DisplayPuzzler).puzzler;
        }
        return puzzler;
    },

    choices: function(choices: (ChoiceFormatted | null)[] = initialState.choices, action: Action) {
        if (action.type === Type.DISPLAY_PUZZLER) {
            return trimOrExtend(choices, (action as DisplayPuzzler).puzzler.choicesCount);
        }

        if (action.type === Type.DISPLAY_CHOICE) {
            const {choice, code} = action as DisplayChoice;
            return [...choices.slice(0, choice), code, ...choices.slice(choice + 1)];
        }
        return choices;
    },
});

function trimOrExtend<T>(a: (T | null)[], size: number): (T | null)[] {
    if (a.length >= size) {
        return a.slice(0, size);
    }

    return [...a, ...R.repeat(null, size - a.length)];
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
