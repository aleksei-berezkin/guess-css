import { apply, call, put, select, takeEvery, takeLeading } from 'redux-saga/effects';
import {
    CheckChoice,
    DisplayAnswer,
    DisplayPuzzler,
    LoadNextPuzzler,
    Type
} from './actions';
import { fetchChoices, fetchCorrectChoice, fetchGenPuzzler } from '../clientApi';
import { ChoiceCodes, CorrectChoiceResponse, GenPuzzlerResponse } from '../../shared/api';
import { State } from './store';

export function* rootSaga() {
    yield takeEvery(Type.LOAD_NEXT_PUZZLER, loadNextPuzzler);
    yield takeLeading(Type.CHECK_CHOICE, checkChoice);
}

function *loadNextPuzzler(_: LoadNextPuzzler) {
    const r1: Response = yield call(fetchGenPuzzler);
    const genPuzzlerResponse: GenPuzzlerResponse = yield apply(r1, r1.json, []);
    const {id, token} = genPuzzlerResponse;

    const isVeryFirst = yield select((st: State) => !st.puzzlers.length);
    const r2: Response = yield call(fetchChoices, id, token, isVeryFirst);
    const choiceCodes: ChoiceCodes = yield apply(r2, r2.json, []);

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
