import { TagNode, TextNode } from '../nodes';
import { randomBounded } from './randomItems';
import { letterByIndex } from '../../util/letterByIndex';

export function genDivs(min: number, max: number, classes?: 'abc' | ((i: number) => string[])): TagNode[] {
    if (min < 1 || max < min) {
        throw new Error();
    }

    function getClasses(i: number) {
        if (!classes) {
            return [];
        }
        if (classes === 'abc') {
            return [letterByIndex(i)];
        }
        return classes(i);
    }

    return Array.from({length: randomBounded(min, max + 1)})
        .map((_, i) => [i, getClasses(i)] as const)
        .map(([i, classes]) => new TagNode(
            'div',
            classes,
            [new TextNode(classes.join('') || letterByIndex(i))],
        ));
}
