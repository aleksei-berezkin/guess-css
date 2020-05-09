import { Puzzler } from '../../puzzler';
import { TagNode } from '../../nodes';
import { Vector } from 'prelude-ts';
import { genClassedDivs } from '../genClassedDivs';
import { genFlexboxCss } from './genFlexboxCss';

export function genFlexboxPuzzler(): Puzzler {
    const body = new TagNode('body', Vector.of(), genClassedDivs(2, 4));
    return new Puzzler(body, genFlexboxCss(body));
}
