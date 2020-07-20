import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PuzzlerApp } from './components/puzzlerApp';
import { Provider } from 'react-redux';
import { createAppStore, State } from './redux/store';
import { ROOT_EL_ID } from '../../templateConst';
import { PRELOADED_STATE_ID } from './redux/preloadedStateId';


const preloadedState = window[PRELOADED_STATE_ID];

if (preloadedState) {
    ReactDOM.hydrate(
        createApp(preloadedState),
        document.getElementById(ROOT_EL_ID)
    );
    delete window[PRELOADED_STATE_ID];
} else {
    ReactDOM.render(
        createApp(),
        document.getElementById(ROOT_EL_ID)
    );
}

function createApp(state?: State) {
    return <Provider store={ createAppStore(state) }>
        <PuzzlerApp/>
    </Provider>;
}
