import { range, stream } from 'fluent-streams';

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
    return range(0, items.length)
        .takeRandom(n)
        .sortBy(i => i)
        .map(i => items[i])
        .toArray();
}

export function getNShuffled(items: string[], n: number): string[][] {
    if (n > 3) {
        throw Error('n=' + n);
    }
    const shuffled1 = stream(items).shuffle().toArray();
    const shuffled2 = (function shuffle2(): string[] {
        const _shuffled2 = stream(items).shuffle().toArray();
        if (stream(shuffled1).equals(_shuffled2)) {
            return shuffle2();
        }
        return _shuffled2;
    })();

    if (n === 2) {
        return [shuffled1, shuffled2];
    }

    const shuffled3 = (function shuffle3(): string[] {
        const _shuffled3 = stream(items).shuffle().toArray();
        if (stream(shuffled1).equals(_shuffled3) || stream(shuffled2).equals(_shuffled3)) {
            return shuffle3();
        }
        return _shuffled3;
    })();

    return [shuffled1, shuffled2, shuffled3];
}