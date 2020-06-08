import { displayAnswer, displayNewPuzzler, setTopics } from './actions';
import { genPuzzler } from '../model/gen/genPuzzler';
import { State } from './store';
import { getRandomizedTopics } from '../model/gen/topic';
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import { stream } from '../stream/stream';

type MyThunk = ThunkAction<void, State, never, Action<string>>;

export function initClient(): MyThunk {
    return function(dispatch, getState) {
        if (getState().puzzlerViews.length) {
            // Already initialized
            return;
        }
        dispatch(setTopics(getRandomizedTopics()));
        dispatch(genNewPuzzler(true));
    };
}

export function genNewPuzzler(diffHint: boolean): MyThunk {
    return function(dispatch, getState) {
        const state = getState();
        const topic = state.topics[state.puzzlerViews.length % state.topics.length]

        const puzzler = genPuzzler(topic);
        dispatch(displayNewPuzzler(puzzler, diffHint));
    }
}

export function checkChoice(userChoice: number): MyThunk {
    return function(dispatch, getState) {
        const correctChoice = stream(getState().puzzlerViews).last().get().correctChoice;
        dispatch(displayAnswer(userChoice, correctChoice === userChoice));
    }
}
