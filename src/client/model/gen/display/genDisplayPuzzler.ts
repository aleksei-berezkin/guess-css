import { Puzzler } from '../../puzzler';
import { TagNode } from '../../nodes';
import { genClassedDivs } from '../genClassedDivs';
import { genDisplayCss } from './genDisplayCss';

export function genDisplayPuzzler(): Puzzler {
    const body = new TagNode('body', [],
        [
            new TagNode(
                'div', ['outer'],
                genClassedDivs(2, 4)
            )
        ]
    );
    return new Puzzler(body, genDisplayCss(body));
}
