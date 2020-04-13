import { State } from './store';
import { Vector } from 'prelude-ts';

type VectorToArray<T> = T extends Vector<infer I> ? Array<VectorToArray<I>> : KeysToArray<T>;

type KeysToArray<T> = {
    [K in keyof T]: VectorToArray<T[K]>
};

export type SerializedState = KeysToArray<State>;

export function toSerializable(state: State): SerializedState {
    return {
        puzzlerViews: state.puzzlerViews
            .map(view => ({
                source: view.source,
                choiceCodes: view.choiceCodes
                    .map(choiceCode => choiceCode.toArray())
                    .toArray(),
                userChoice: view.userChoice,
                correctChoice: view.correctChoice,
            }))
            .toArray(),
        current: state.current,
        correctAnswers: state.correctAnswers,
    };
}

export function fromSerializable(state: SerializedState): State {
    return {
        puzzlerViews: Vector.ofIterable(state.puzzlerViews)
            .map(view => ({
                source: view.source,
                choiceCodes: Vector.ofIterable(view.choiceCodes)
                    .map(choiceCode => Vector.ofIterable(choiceCode)),
                userChoice: view.userChoice,
                correctChoice: view.correctChoice,
            })),
        current: state.current,
        correctAnswers: state.correctAnswers,
    };
}
