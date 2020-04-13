import { put, select, takeEvery, takeLeading } from 'redux-saga/effects';
import {
    CheckChoice,
    DisplayAnswer,
    DisplayNewPuzzler,
    GenNewPuzzler,
    Type
} from './actions';
import { genPuzzler } from '../model/genPuzzler';
import { State } from './store';

export function* rootSaga() {
    yield takeEvery(Type.GEN_NEW_PUZZLER, loadNextPuzzler);
    yield takeLeading(Type.CHECK_CHOICE, checkChoice);
}

function *loadNextPuzzler(action: GenNewPuzzler) {
    const puzzler = genPuzzler();

    yield put<DisplayNewPuzzler>({
        type: Type.DISPLAY_NEW_PUZZLER,
        source: puzzler.html,
        choiceCodes: puzzler.getChoiceCodes(action.diffHint),
        correctChoice: puzzler.correctChoice,
    });
}

function *checkChoice(action: CheckChoice) {
    const correctChoice: number = yield select((state: State) => state.puzzlerViews.head().getOrThrow().correctChoice);

    yield put<DisplayAnswer>({
        type: Type.DISPLAY_ANSWER,
        userChoice: action.userChoice,
        isCorrect: correctChoice === action.userChoice,
    });
}
