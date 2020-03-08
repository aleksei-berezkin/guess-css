import { apply, call, put, takeEvery, takeLeading } from 'redux-saga/effects';
import {
    CheckChoice,
    DisplayAnswer,
    DisplayPuzzler,
    LoadNextPuzzler,
    Type
} from './actions';
import { fetchCorrectChoice, fetchGenPuzzler } from '../clientApi';
import { CorrectChoiceResponse, GenPuzzlerResponse } from '../../shared/api';

export function* rootSaga() {
    yield takeEvery(Type.LOAD_NEXT_PUZZLER, loadNextPuzzler);
    yield takeLeading(Type.CHECK_CHOICE, checkChoice);
}

function *loadNextPuzzler(loadNextPuzzler: LoadNextPuzzler) {
    const r1: Response = yield call(fetchGenPuzzler, loadNextPuzzler.diffHint);
    const genPuzzlerResponse: GenPuzzlerResponse = yield apply(r1, r1.json, []);
    const {id, token, choiceCodes} = genPuzzlerResponse;

    const displayPuzzler: DisplayPuzzler = {
        type: Type.DISPLAY_PUZZLER,
        puzzlerId: id,
        token,
        choiceCodes,
    }
    yield put(displayPuzzler);
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
