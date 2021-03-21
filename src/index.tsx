import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PuzzlerApp } from './components/puzzlerApp';
import { Provider } from 'react-redux';
import { createAppStore, State } from './redux/store';


ReactDOM.render(
    createApp(),
    document.getElementById('app-root-div')
);

function createApp(state?: State) {
    return <Provider store={ createAppStore(state) }>
        <PuzzlerApp/>
    </Provider>;
}
