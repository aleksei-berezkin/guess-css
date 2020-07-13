import { Puzzler } from '../puzzler';
import { genSelectorsPuzzler } from './selectors/genSelectorsPuzzler';
import { genDisplayPuzzler } from './display/genDisplayPuzzler';
import { genPositionPuzzler } from './position/genPositionPuzzler';
import { genFlexboxPuzzler } from './flexbox/genFlexboxPuzzler';
import { Topic } from './topic';
import { continually, entryStream } from '../../stream/stream';

const generators: {[k in Topic]: () => Puzzler} = {
    display: genDisplayPuzzler,
    flexbox: genFlexboxPuzzler,
    position: genPositionPuzzler,
    selectors: genSelectorsPuzzler,
}

export function genPuzzler(topic: Topic): Puzzler {
    return generators[topic]();
}

export function getRandomizedTopics(): Topic[] {
    return continually(() => entryStream(generators).map(([k, _]) => k).shuffle())
        .take(5)
        .flatMap(v => v)
        .toArray();
}
