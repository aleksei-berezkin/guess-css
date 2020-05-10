import { put, select, takeEvery, takeLeading } from 'redux-saga/effects';
import { CheckChoice, DisplayAnswer, DisplayNewPuzzler, GenNewPuzzler, SetTopics, Type } from './actions';
import { genPuzzler } from '../model/gen/genPuzzler';
import { State } from './store';
import { getRandomizedTopics, Topic } from '../model/gen/topic';

export function* rootSaga() {
    yield takeEvery(Type.INIT_CLIENT, initClient);
    yield takeEvery(Type.GEN_NEW_PUZZLER, genNewPuzzler);
    yield takeLeading(Type.CHECK_CHOICE, checkChoice);
}

function *initClient() {
    const topics = getRandomizedTopics();
    yield put<SetTopics>({
        type: Type.SET_TOPICS,
        topics,
    });

    yield put<GenNewPuzzler>({
        type: Type.GEN_NEW_PUZZLER,
        diffHint: true,
    });
}

function *genNewPuzzler(action: GenNewPuzzler) {
    const topic: Topic = yield select(
        (state: State) =>
            state.topics
                .get(state.puzzlerViews.length() % state.topics.length())
                .getOrThrow()
    );

    const puzzler = genPuzzler(topic);

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
