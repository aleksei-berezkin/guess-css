import { Vector } from 'prelude-ts';
import { randomItem } from '../../util';
import { Puzzler } from '../puzzler';
import { genSelectorsPuzzler } from './selectors/genSelectorsPuzzler';
import { genDisplayPuzzler } from './display/genDisplayPuzzler';
import { genPositionPuzzler } from './position/genPositionPuzzler';
import { genFlexboxPuzzler } from './flexbox/genFlexboxPuzzler';

const generators = Vector.of(genDisplayPuzzler, genFlexboxPuzzler, genPositionPuzzler, genSelectorsPuzzler);

export function genPuzzler(): Puzzler {
    return randomItem(generators)();
}
