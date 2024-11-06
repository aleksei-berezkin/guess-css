import { rangeFromTo } from '../../util/range';

export function twoElementVariationsInOrder<T>(items: T[]): [T, T][] {
    if (!items || items.length < 2) {
        throw new Error('Bad items: ' + items);
    }

    return Array.from({length: items.length})
        .flatMap((_, i) => rangeFromTo(i + 1, items.length).map(
            j => [i, j]
        ))
        .map(([i, j]) => [items[i], items[j]] as [T, T]);
}

export function xprod<T>(a: T[], b: T[]): [T, T][] {
    return a.flatMap(a => b.map(b => [a, b] as [T, T]));
}
