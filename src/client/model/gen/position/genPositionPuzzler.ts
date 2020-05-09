import { Puzzler } from '../../puzzler';
import { TagNode } from '../../nodes';
import { Vector } from 'prelude-ts';
import { genClassedDivs } from '../genClassedDivs';
import { genPositionCss } from './genPositionCss';

export function genPositionPuzzler(): Puzzler {
    const body = new TagNode('body', Vector.of(),
        Vector.of(
            new TagNode('div', Vector.of('outer'), genClassedDivs(2, 4))
        )
    );
    return new Puzzler(body, genPositionCss(body));
}
