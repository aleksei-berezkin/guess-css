import { Puzzler } from '../puzzler';
import { genSelectorsPuzzler } from './selectors/genSelectorsPuzzler';
import { genDisplayPuzzler } from './display/genDisplayPuzzler';
import { genPositionPuzzler } from './position/genPositionPuzzler';
import { genFlexboxPuzzler } from './flexbox/genFlexboxPuzzler';
import { Topic } from './topic';
import { genGridTemplatesPuzzler } from './gridTemplates/genGridTemplatesPuzzler';
import { genGridItemsPuzzler } from './gridItems/genGridItemsPuzzler';

const generators: {[k in Topic]: () => Puzzler} = {
    Display: genDisplayPuzzler,
    Flexbox: genFlexboxPuzzler,
    Position: genPositionPuzzler,
    Selectors: genSelectorsPuzzler,
    'Grid templates': genGridTemplatesPuzzler,
    'Grid items': genGridItemsPuzzler,
}

export function genPuzzler(topic: Topic): Puzzler {
    return generators[topic]();
}
