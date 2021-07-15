import { Puzzler } from '../puzzler';
import { genSelectorsPuzzler } from './selectors/genSelectorsPuzzler';
import { genDisplayPuzzler } from './display/genDisplayPuzzler';
import { genPositionPuzzler } from './position/genPositionPuzzler';
import { genFlexboxPuzzler } from './flexbox/genFlexboxPuzzler';
import { Topic } from './topic';
import { genGridPuzzler } from './grid/genGridPuzzler';

const generators: {[k in Topic]: () => Puzzler} = {
    display: genDisplayPuzzler,
    flexbox: genFlexboxPuzzler,
    position: genPositionPuzzler,
    selectors: genSelectorsPuzzler,
    grid: genGridPuzzler,
}

export function genPuzzler(topic: Topic): Puzzler {
    return generators[topic]();
}
