import { TagNode, TextNode } from '../nodes';
import { abc, range } from 'fluent-streams';
import { randomBounded } from './randomItems';

export function genDivs(min: number, max: number, classes?: 'abc' | ((i: number) => string[])): TagNode[] {
    if (min < 1 || max < min) {
        throw new Error();
    }

    function getClasses(i: number) {
        if (!classes) {
            return [];
        }
        if (classes === 'abc') {
            return abc().at(i).toArray();
        }
        return classes(i);
    }

    return range(0, randomBounded(min, max + 1))
        .map(i => [i, getClasses(i)] as const)
        .map(([i, classes]) => new TagNode(
            'div',
            classes,
            [new TextNode(classes.join('') || abc().at(i).get())],
        ))
        .take(randomBounded(min, max + 1))
        .toArray();
}
