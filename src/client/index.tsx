import './styles.less';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Puzzler } from './components/Puzzler';
import { Provider } from 'react-redux';
import { createAppStore, initialState } from './redux/store';
// @ts-ignore
import { ROOT_EL_ID } from '../shared/appWideConst';

// @ts-ignore
const preloadedState = window.__PRELOADED_STATE__;

if (preloadedState) {
    ReactDOM.hydrate(
        <Provider store={ createAppStore(preloadedState) }>
            <Puzzler/>
        </Provider>,
        document.getElementById(ROOT_EL_ID)
    );
    // @ts-ignore
    delete window.__PRELOADED_STATE__;
} else {
    ReactDOM.render(
        <Provider store={ createAppStore(initialState) }>
            <Puzzler/>
        </Provider>,
        document.getElementById(ROOT_EL_ID)
    );
}
