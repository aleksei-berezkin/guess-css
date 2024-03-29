import { Puzzler } from '../../puzzler';
import { TagNode } from '../../nodes';
import { genDivs } from '../genDivs';
import { genFlexboxCss } from './genFlexboxCss';

export function genFlexboxPuzzler(canWrap: boolean): Puzzler {
    const body = new TagNode('body', [], genDivs(2, 3));
    return new Puzzler(body, genFlexboxCss(body, canWrap), true);
}
