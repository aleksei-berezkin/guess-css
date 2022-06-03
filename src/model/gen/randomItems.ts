import { takeRandom } from '../../util/takeRandom';
import { range } from '../../util/range';
import { shuffle } from '../../util/shuffle';
import { arraysEqual } from '../../util/arraysEqual';

export function randomBounded(bound: number): number;
export function randomBounded(start: number, bound: number): number;
export function randomBounded(lhs: number, rhs?: number) {
    if (rhs != undefined) {
        return lhs + Math.floor(Math.random() * (rhs - lhs));
    }
    return Math.floor(Math.random() * lhs);
}

export function randomItemsInOrder<T>(items: T[], n: number): T[] {
    if (n > items.length) {
        throw Error(n + '>' + items.length);
    }
    if (n === 0) {
        return [];
    }
    if (n === items.length) {
        return items;
    }
    return takeRandom(range(items.length), n)
        .sort((a, b) => b - a)
        .map(i => items[i]);
}

export function getNShuffled(items: string[], n: number): string[][] {
    if (n > 3) {
        throw Error('n=' + n);
    }
    const shuffled1 = shuffle(items);
    const shuffled2 = (function shuffle2(): string[] {
        const _shuffled2 = shuffle(items);
        if (arraysEqual(shuffled1, _shuffled2)) {
            return shuffle2();
        }
        return _shuffled2;
    })();

    if (n === 2) {
        return [shuffled1, shuffled2];
    }

    const shuffled3 = (function shuffle3(): string[] {
        const _shuffled3 = shuffle(items);
        if (arraysEqual(shuffled1, _shuffled3) || arraysEqual(shuffled2, _shuffled3)) {
            return shuffle3();
        }
        return _shuffled3;
    })();

    return [shuffled1, shuffled2, shuffled3];
}
