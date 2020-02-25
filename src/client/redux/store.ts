import { GenPuzzlerResponse, Region } from '../../shared/api';
import { Action, DisplayChoice, DisplayPuzzler, Type } from './actions';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './saga';


export interface State {
    puzzler: GenPuzzlerResponse | null,
    choiceCodes: (ChoiceCode | null)[],
}

interface ChoiceCode {
    puzzlerId: string,
    code: Region[][],
}

const initialState: State = {
    puzzler: null,
    choiceCodes: [],
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
            const {puzzler, choice, code} = action as DisplayChoice;
            const newChoiceCodes = [...choiceCodes];
            newChoiceCodes[choice] = {
                puzzlerId: puzzler.id,
                code
            };
            return newChoiceCodes;
        }
        return choiceCodes;
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
