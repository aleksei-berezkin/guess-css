import { TagNode, TextNode } from '../nodes';
import { abc, stream } from 'fluent-streams';
import { randomBounded } from './randomItems';

export function genClassedDivs(min: number, max: number): TagNode[] {
    if (min < 1 || max < min) {
        throw new Error();
    }

    return stream(abc())
        .map(clazz => new TagNode('div', [clazz], [new TextNode(clazz)]))
        .take(randomBounded(min, max + 1))
        .toArray();
}
