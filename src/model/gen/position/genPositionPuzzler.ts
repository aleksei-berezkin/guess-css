import { Puzzler } from '../../puzzler';
import { TagNode } from '../../nodes';
import { genDivs } from '../genDivs';
import { genPositionCss } from './genPositionCss';

export function genPositionPuzzler(): Puzzler {
    const body = new TagNode('body', [],
        [
            new TagNode('div', ['root'], genDivs(2, 3, 'abc'))
        ]
    );
    return new Puzzler(body, genPositionCss(body));
}
