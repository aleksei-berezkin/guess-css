import { apply, call, put, takeEvery, takeLeading, putResolve } from 'redux-saga/effects';
import { CheckChoice, DisplayChoice, DisplayPuzzler, LoadChoice, LoadNextPuzzler, Type } from './actions';
import { fetchCheck, fetchChoice, fetchGenPuzzler } from '../clientApi';
import { CheckResponse, ChoiceFormatted, GenPuzzlerResponse } from '../../shared/api';
import * as R from 'ramda';

export function* rootSaga() {
    yield takeEvery(Type.LOAD_NEXT_PUZZLER, loadNextPuzzler);
    yield takeEvery(Type.LOAD_CHOICE, loadChoice);
    yield takeLeading(Type.CHECK_CHOICE, checkChoice);
}

function *loadNextPuzzler(_: LoadNextPuzzler) {
    const r: Response = yield call(fetchGenPuzzler);
    const puzzler: GenPuzzlerResponse = yield apply(r, r.json, []);
    const displayPuzzler: DisplayPuzzler = {
        type: Type.DISPLAY_PUZZLER,
        puzzler,
    };
    yield putResolve(displayPuzzler);

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

function *checkChoice(checkChoice: CheckChoice) {
    const r: Response = yield call(fetchCheck, checkChoice.puzzler);
    const checkResponse: CheckResponse = yield apply(r, r.json, []);
    const message = checkChoice.choice === checkResponse.correctChoice
        ? 'Correct!' : 'Incorrect!';
    alert(message);
}
