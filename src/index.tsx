import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PuzzlerApp } from './components/puzzlerApp';
import { Provider } from 'react-redux';
import { createAppStore } from './redux/store';


ReactDOM.render(
    createApp(),
    document.getElementById('app-root-div')
);

function createApp() {
    return <Provider store={ createAppStore() }>
        <PuzzlerApp basename={ getBasename() }/>
    </Provider>;
}

function getBasename() {
    return location.host.includes('github') ? '/guess-css-site' : undefined;
}
