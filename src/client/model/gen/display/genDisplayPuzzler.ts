import { Puzzler } from '../../puzzler';
import { TagNode } from '../../nodes';
import { Vector } from 'prelude-ts';
import { genClassedDivs } from '../genClassedDivs';
import { genDisplayCss } from './genDisplayCss';

export function genDisplayPuzzler(): Puzzler {
    const body = new TagNode('body', Vector.empty(),
        Vector.of(
            new TagNode(
                'div', Vector.of('outer'),
                genClassedDivs(2, 4)
            )
        )
    );
    return new Puzzler(body, genDisplayCss(body));
}
