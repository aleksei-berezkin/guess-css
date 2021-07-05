import { genPuzzler } from '../model/gen/genPuzzler';
import { State } from './store';
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import { assignColorVars } from './assignColorVar';
import ReactGA from 'react-ga';
import { puzzlerViews as puzzlerViewsSlice} from './slices/puzzlerViews';
import { current } from './slices/current';
import { correctAnswers } from './slices/correctAnswers';
import { topics } from '../model/gen/topic';

type VoidThunk = ThunkAction<void, State, never, Action<string>>;

export function genNewPuzzler(diffHint: boolean): VoidThunk {
    return function(dispatch, getState) {
        const state = getState();
        const topic = topics[state.puzzlerViews.length % topics.length]

        const puzzler = genPuzzler(topic);
        dispatch(puzzlerViewsSlice.actions.append({
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
        dispatch(current.actions.to(getState().puzzlerViews.length - 1));
        dispatch(gaNewPuzzler());
    }
}

export function checkChoice(userChoice: number): VoidThunk {
    return function(dispatch, getState) {
        const {puzzlerViews, current} = getState();
        const isCorrect = puzzlerViews[current].status.correctChoice === userChoice;
        dispatch(puzzlerViewsSlice.actions.displayAnswer({index: current, userChoice}));
        if (isCorrect) {
            dispatch(correctAnswers.actions.inc());
        }
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
