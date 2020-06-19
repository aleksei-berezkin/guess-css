import { displayAnswer, displayNewPuzzler, setTopics } from './actions';
import { genPuzzler } from '../model/gen/genPuzzler';
import { State } from './store';
import { getRandomizedTopics } from '../model/gen/topic';
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import { stream } from '../stream/stream';

type VoidThunk = ThunkAction<void, State, never, Action<string>>;

export function initClient(): VoidThunk {
    return function(dispatch, getState) {
        if (getState().puzzlerViews.length) {
            // Already initialized
            return;
        }
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
            body: puzzler.bodyCode,
            status: {
                correctChoice: puzzler.correctChoice,
                userChoice: undefined,
            },
            currentTab: 0,
        }));
    }
}

export function checkChoice(userChoice: number): VoidThunk {
    return function(dispatch, getState) {
        const isCorrect = stream(getState().puzzlerViews).last().get().status.correctChoice === userChoice;
        dispatch(displayAnswer({userChoice, isCorrect}));
    }
}
