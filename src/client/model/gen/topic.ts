import { Vector } from 'prelude-ts';
import { Stream } from 'prelude-ts/dist/src/Stream';

export enum Topic {
    DISPLAY = 'DISPLAY',
    FLEXBOX = 'FLEXBOX',
    POSITION = 'POSITION',
    SELECTORS = 'SELECTORS',
}

export function getRandomizedTopics(): Vector<Topic> {
    return Stream.continually(() => Vector.ofIterable(Object.keys(Topic)).shuffle() as Vector<Topic>)
        .take(5)
        .toVector()
        .flatMap(v => v);
}
