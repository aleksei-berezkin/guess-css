import './styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Puzzler } from './components/Puzzler';
import { Provider } from 'react-redux';
import { createAppStore } from './redux/store';

ReactDOM.render(
    <Provider store={ createAppStore() }>
        <Puzzler/>
    </Provider>,
    document.getElementById('app-root-div')
);
