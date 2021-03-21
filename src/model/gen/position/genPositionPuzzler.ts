import { Puzzler } from '../../puzzler';
import { TagNode } from '../../nodes';
import { genClassedDivs } from '../genClassedDivs';
import { genPositionCss } from './genPositionCss';

export function genPositionPuzzler(): Puzzler {
    const body = new TagNode('body', [],
        [
            new TagNode('div', ['root'], genClassedDivs(2, 3))
        ]
    );
    return new Puzzler(body, genPositionCss(body));
}
