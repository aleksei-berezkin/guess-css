import './styles.less';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Puzzler } from './components/Puzzler';
import { Provider } from 'react-redux';
import { createAppStore, initialState, State } from './redux/store';
// @ts-ignore
import { ROOT_EL_ID } from '../shared/appWideConst';
import { fromSerializable, SerializedState } from './redux/stateSerialization';
import { PRELOADED_STATE_ID } from '../shared/preloadedStateId';


const preloadedState: SerializedState = window[PRELOADED_STATE_ID];

if (preloadedState) {
    ReactDOM.hydrate(
        <Provider store={ createAppStore(fromSerializable(preloadedState)) }>
            <Puzzler/>
        </Provider>,
        document.getElementById(ROOT_EL_ID)
    );
    delete window[PRELOADED_STATE_ID];
} else {
    ReactDOM.render(
        <Provider store={ createAppStore(initialState) }>
            <Puzzler/>
        </Provider>,
        document.getElementById(ROOT_EL_ID)
    );
}
