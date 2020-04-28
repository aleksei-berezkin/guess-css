import { Option, Ordering, Vector } from 'prelude-ts';

export function randomItem<T>(items: Vector<T>): T;
export function randomItem<T>(items: T[]): T;
export function randomItem<T>(items: Vector<T> | T[]): T {
    if (items instanceof Vector) {
        return items.get(randomBounded(items.length())).getOrThrow();
    }
    return items[randomBounded(items.length)];
}

export function randomNumericalEnum(enm: {[k: number]: string}): number {
    return randomItem(
        Vector.ofIterable(Object.getOwnPropertyNames(enm))
            .map(k => parseInt(k))
            .filter(n => !Number.isNaN(n))
    );
}

export function randomBounded(bound: number): number;
export function randomBounded(start: number, bound: number): number;
export function randomBounded(lhs: number, rhs?: number) {
    if (rhs != undefined) {
        return lhs + Math.floor(Math.random() * (rhs - lhs));
    }
    return Math.floor(Math.random() * lhs);
}

export function randomItemsInOrder<T>(items: Vector<T>, n: number): Vector<T> {
    if (n > items.length()) {
        throw Error(n + '>' + items.length());
    }
    if (n === 0) {
        return Vector.empty();
    }
    if (n === items.length()) {
        return items;
    }
    return range(0, items.length())
        .shuffle()
        .take(n)
        .sortOn(i => i)
        .map(i => items.get(i).getOrThrow());
}

export function twoElementVariationsInOrder<T>(items: Vector<T>): Vector<[T, T]> {
    if (!items || items.length() < 2) {
        throw new Error('Bad items: ' + items);
    }

    return range(0, items.length())
        .flatMap(i => range(i + 1, items.length()).map(
            j => [i, j]
        ))
        .map(([i, j]) => [items.get(i).getOrThrow(), items.get(j).getOrThrow()]);
}

export function range(from: number, bound: number): Vector<number> {
    return Vector.unfoldRight(
        from,
        i => Option.of(i).filter(i => i < bound).map(i => [i, i + 1])
    );
}

export function xprod<T>(a: Vector<T>, b: Vector<T>): Vector<[T, T]> {
    return a.flatMap(a => b.map(b => [a, b]));
}
