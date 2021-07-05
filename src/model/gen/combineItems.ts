import { range, stream, Stream } from 'fluent-streams';

export function twoElementVariationsInOrder<T>(items: T[]): Stream<readonly [T, T]> {
    if (!items || items.length < 2) {
        throw new Error('Bad items: ' + items);
    }

    return range(0, items.length)
        .flatMap(i => range(i + 1, items.length).map(
            j => [i, j]
        ))
        .map(([i, j]) => [items[i], items[j]] as const);
}

export function xprod<T>(a: T[], b: T[]): Stream<(readonly [T, T])> {
    return stream(a).flatMap(a => b.map(b => [a, b]));
}