import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Puzzler } from './components/puzzler';
import { Provider } from 'react-redux';
import { createAppStore, initialState } from './redux/store';
import { ROOT_EL_ID } from '../shared/appWideConst';
import { PRELOADED_STATE_ID } from '../shared/preloadedStateId';


const preloadedState = window[PRELOADED_STATE_ID];

if (preloadedState) {
    ReactDOM.hydrate(
        <Provider store={ createAppStore(preloadedState) }>
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
