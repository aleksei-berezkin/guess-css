import { displayAnswer, displayNewPuzzler, setTopics } from './actions';
import { genPuzzler, getRandomizedTopics } from '../model/gen/genPuzzler';
import { State } from './store';
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import { stream } from '../stream/stream';
import { assignColorVars } from './assignColorVar';
import ReactGA from 'react-ga';

type VoidThunk = ThunkAction<void, State, never, Action<string>>;

export function initClient(): VoidThunk {
    return function(dispatch) {
        dispatch(setTopics(getRandomizedTopics()));
        dispatch(genNewPuzzler(true));
    };
}

export function genNewPuzzler(diffHint: boolean): VoidThunk {
    return function(dispatch, getState) {
        const state = getState();
        const topic = state.topics[state.puzzlerViews.length % state.topics.length]

        const puzzler = genPuzzler(topic);
        dispatch(displayNewPuzzler({
            source: puzzler.html,
            styleChoices: puzzler.getStyleCodes(diffHint),
            commonStyleSummary: puzzler.commonStyleSummary,
            commonStyle: puzzler.commonStyleCode,
            vars: {
                contrastColor: puzzler.rules.vars.contrastColor,
                colors: assignColorVars(puzzler.rules.vars.colors),
            },
            body: puzzler.bodyCode,
            status: {
                correctChoice: puzzler.correctChoice,
                userChoice: undefined,
            },
            currentTab: 0,
        }));
        dispatch(gaNewPuzzler());
    }
}

export function checkChoice(userChoice: number): VoidThunk {
    return function(dispatch, getState) {
        const isCorrect = stream(getState().puzzlerViews).last().get().status.correctChoice === userChoice;
        dispatch(displayAnswer({userChoice, isCorrect}));
    }
}

export function gaInit(): VoidThunk {
    return function() {
        ReactGA.initialize('UA-171636839-1');
        ReactGA.pageview('/');
    }
}

export function gaNewPuzzler(): VoidThunk {
    return function(_, getState) {
        ReactGA.event({
            category: 'NewPuzzler',
            action: String(getState().current),
        });
    }
}
