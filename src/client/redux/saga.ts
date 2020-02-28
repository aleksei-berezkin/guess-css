import { apply, call, put, putResolve, takeEvery, takeLeading } from 'redux-saga/effects';
import {
    CheckChoice,
    DisplayAnswer,
    DisplayChoice,
    DisplayPuzzler,
    LoadChoice,
    LoadNextPuzzler,
    Type
} from './actions';
import { fetchChoice, fetchCorrectChoice, fetchGenPuzzler } from '../clientApi';
import { ChoiceCode, CorrectChoiceResponse, PuzzlerSpec } from '../../shared/api';
import * as R from 'ramda';

export function* rootSaga() {
    yield takeEvery(Type.LOAD_NEXT_PUZZLER, loadNextPuzzler);
    yield takeEvery(Type.LOAD_CHOICE, loadChoice);
    yield takeLeading(Type.CHECK_CHOICE, checkChoice);
}

function *loadNextPuzzler(_: LoadNextPuzzler) {
    const r: Response = yield call(fetchGenPuzzler);
    const puzzler: PuzzlerSpec = yield apply(r, r.json, []);
    const displayPuzzler: DisplayPuzzler = {
        type: Type.DISPLAY_PUZZLER,
        puzzler,
    };
    yield putResolve(displayPuzzler);

    yield *R.range(0, puzzler.choicesCount)
        .map(choice => {
            const loadChoice: LoadChoice = {
                type: Type.LOAD_CHOICE,
                puzzlerId: puzzler.id,
                choice,
                token: puzzler.token,
            };
            return put(loadChoice);
        });
}

function *loadChoice(loadChoice: LoadChoice) {
    const r: Response = yield call(fetchChoice, loadChoice.puzzlerId, loadChoice.choice, loadChoice.token);
    const code: ChoiceCode = yield apply(r, r.json, []);
    const displayChoice: DisplayChoice = {
        type: Type.DISPLAY_CHOICE,
        puzzlerId: loadChoice.puzzlerId,
        choice: loadChoice.choice,
        code,
    };
    yield put(displayChoice);
}

function *checkChoice(checkChoice: CheckChoice) {
    const r: Response = yield call(fetchCorrectChoice, checkChoice.puzzlerId, checkChoice.token);
    const correctChoice: CorrectChoiceResponse = yield apply(r, r.json, []);

    const displayAnswer: DisplayAnswer = {
        type: Type.DISPLAY_ANSWER,
        puzzlerId: checkChoice.puzzlerId,
        userChoice: checkChoice.choice,
        correctChoice,
    }
    yield put(displayAnswer);
}
