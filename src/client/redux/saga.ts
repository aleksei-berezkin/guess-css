import { apply, call, put, takeEvery } from 'redux-saga/effects';
import { DisplayChoice, DisplayLayout, LoadChoice, LoadNextPuzzler, Type } from './actions';
import { fetchChoice, fetchGenPuzzler } from '../clientApi';
import { ChoiceFormatted, GenPuzzlerResponse } from '../../shared/beans';
import { randomBounded } from '../../shared/util';
import * as R from 'ramda';

export function* rootSaga() {
    yield takeEvery(Type.LOAD_NEXT_PUZZLER, loadNextPuzzler);
    yield takeEvery(Type.LOAD_CHOICE, loadChoice);
}

function *loadNextPuzzler(_: LoadNextPuzzler) {
    const r: Response = yield call(fetchGenPuzzler);
    const puzzler: GenPuzzlerResponse = yield apply(r, r.json, []);
    const displayLayout: DisplayLayout = {
        type: Type.DISPLAY_LAYOUT,
        puzzler,
        correctChoice: randomBounded(puzzler.choicesCount),
    };
    yield put(displayLayout);

    yield *R.range(0, puzzler.choicesCount)
        .map(choice => {
            const loadChoice: LoadChoice = {
                type: Type.LOAD_CHOICE,
                puzzler,
                choice,
            };
            return put(loadChoice);
        });
}

function *loadChoice(loadChoice: LoadChoice) {
    const r: Response = yield call(fetchChoice, loadChoice.puzzler, loadChoice.choice);
    const code: ChoiceFormatted = yield apply(r, r.json, []);
    const displayChoice: DisplayChoice = {
        type: Type.DISPLAY_CHOICE,
        choice: loadChoice.choice,
        code,
    };
    yield put(displayChoice);
}
