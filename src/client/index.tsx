import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PuzzlerApp } from './components/puzzler';
import { Provider } from 'react-redux';
import { createAppStore, initialState, State } from './redux/store';
import { ROOT_EL_ID } from '../shared/templateConst';
import { PRELOADED_STATE_ID } from '../shared/preloadedStateId';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from './components/theme';


const preloadedState = window[PRELOADED_STATE_ID];

if (preloadedState) {
    ReactDOM.hydrate(
        createApp(preloadedState),
        document.getElementById(ROOT_EL_ID)
    );
    delete window[PRELOADED_STATE_ID];
} else {
    ReactDOM.render(
        createApp(initialState),
        document.getElementById(ROOT_EL_ID)
    );
}

function createApp(state: State) {
    return <Provider store={ createAppStore(state) }>
        <ThemeProvider theme={ createTheme() }>
            <PuzzlerApp/>
        </ThemeProvider>
    </Provider>;
}
