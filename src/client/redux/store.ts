import { ChoiceFormatted, GenPuzzlerResponse } from '../../shared/beans';
import { Action, DisplayChoice, DisplayLayout, Type } from './actions';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './saga';


export interface State {
    puzzler: GenPuzzlerResponse | null,
    correctChoice: number | null,
    choices: ChoiceFormatted[],
}

const initialState: State = {
    puzzler: null,
    correctChoice: null,
    choices: [],
};

const rootReducer = combineReducers({
    puzzler: function(current: GenPuzzlerResponse | null = initialState.puzzler, action: Action) {
        if (action.type === Type.DISPLAY_LAYOUT) {
            return (action as DisplayLayout).puzzler;
        }
        return current;
    },

    correctChoice: function(current: number | null = initialState.correctChoice, action: Action) {
        if (action.type === Type.DISPLAY_LAYOUT) {
            return (action as DisplayLayout).correctChoice;
        }
        return current;
    },

    choices: function(current: ChoiceFormatted[] = initialState.choices, action: Action) {
        if (action.type === Type.DISPLAY_CHOICE) {
            const a = action as DisplayChoice;
            const newChoices = [...current];
            newChoices[a.choice] = a.code;
            return newChoices;
        }
        return current;
    },
});

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
