import { TagNode, TextNode } from '../nodes';
import { abc, stream } from 'fluent-streams';
import { randomBounded } from './randomItems';

export function genDivs(min: number, max: number, classes: boolean): TagNode[] {
    if (min < 1 || max < min) {
        throw new Error();
    }

    return stream(abc())
        .map(clazz => new TagNode('div', classes ? [clazz] : [], [new TextNode(clazz)]))
        .take(randomBounded(min, max + 1))
        .toArray();
}
