import { randomBounded } from '../../util';
import { TagNode, TextNode } from '../nodes';
import { stream } from '../../stream/stream';

const abcGen = function* () {
    let code = 'a'.charCodeAt(0);
    for ( ; ; ) {
        yield String.fromCharCode(code++);
    }
}

export function genClassedDivs(min: number, max: number): TagNode[] {
    if (min < 1 || max < min) {
        throw new Error();
    }

    return stream(abcGen())
        .map(clazz => new TagNode('div', [clazz], [new TextNode(clazz)]))
        .take(randomBounded(min, max + 1))
        .toArray();
}
