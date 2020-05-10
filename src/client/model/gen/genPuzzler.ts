import { Puzzler } from '../puzzler';
import { genSelectorsPuzzler } from './selectors/genSelectorsPuzzler';
import { genDisplayPuzzler } from './display/genDisplayPuzzler';
import { genPositionPuzzler } from './position/genPositionPuzzler';
import { genFlexboxPuzzler } from './flexbox/genFlexboxPuzzler';
import { Topic } from './topic';

const generators: {[k in Topic]: () => Puzzler} = {
    [Topic.DISPLAY]: genDisplayPuzzler,
    [Topic.FLEXBOX]: genFlexboxPuzzler,
    [Topic.POSITION]: genPositionPuzzler,
    [Topic.SELECTORS]: genSelectorsPuzzler,
}

export function genPuzzler(topic: Topic): Puzzler {
    return generators[topic]();
}
