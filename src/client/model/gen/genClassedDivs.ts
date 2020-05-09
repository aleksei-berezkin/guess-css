import { randomBounded } from '../../util';
import { Stream, Vector } from 'prelude-ts';
import { TagNode, TextNode } from '../nodes';

const abcStream = Stream.iterate('a', c => String.fromCharCode(c.charCodeAt(0) + 1));

export function genClassedDivs(min: number, max: number): Vector<TagNode> {
    if (min < 1 || max < min) {
        throw new Error();
    }

    return abcStream
        .map(clazz => new TagNode('div', Vector.of(clazz), Vector.of(new TextNode(clazz))))
        .take(randomBounded(min, max + 1))
        .toVector();
}
