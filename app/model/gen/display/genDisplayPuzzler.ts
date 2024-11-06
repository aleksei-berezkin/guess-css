import { Puzzler } from '../../puzzler';
import { TagNode } from '../../nodes';
import { genDivs } from '../genDivs';
import { genDisplayCss } from './genDisplayCss';

export function genDisplayPuzzler(): Puzzler {
    const body = new TagNode('body', [],
        [
            new TagNode(
                'div', ['root'],
                genDivs(2, 3, 'abc')
            )
        ]
    );
    return new Puzzler(body, genDisplayCss(body));
}
