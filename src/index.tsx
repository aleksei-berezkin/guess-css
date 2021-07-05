import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PuzzlerApp } from './ui/puzzlerApp';


ReactDOM.render(
    createApp(),
    document.getElementById('app-root-div')
);

function createApp() {
    return <PuzzlerApp basename={ getBasename() }/>;
}

function getBasename() {
    return location.host.includes('github') ? '/guess-css-site' : undefined;
}
