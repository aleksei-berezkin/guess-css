import { Puzzler } from '../../puzzler';
import { TagNode } from '../../nodes';
import { genClassedDivs } from '../genClassedDivs';
import { genFlexboxCss } from './genFlexboxCss';

export function genFlexboxPuzzler(): Puzzler {
    const body = new TagNode('body', [], genClassedDivs(2, 3));
    return new Puzzler(body, genFlexboxCss(body), true);
}
