import * as R from 'ramda';

export function randomItem<T>(items: T[]): T {
    if (!items || !items.length) {
        throw new Error('Bad items: ' + items);
    }
    return items[randomBounded(items.length)];
}

export function randomBounded(bound: number): number {
    return Math.floor(Math.random() * bound);
}

export function twoElementVariationsInOrder<T>(items: T[]): [T, T][] {
    if (!items || items.length < 2) {
        throw new Error('Bad items: ' + items);
    }
    return R.pipe(
        R.chain((i: number): [number, number][] =>
            R.xprod([i], R.range(i + 1, items.length))
        ),
        R.map(([i, j]): [T, T] => [items[i], items[j]])
    )(R.range(0, items.length - 1));
}

export function nRandom<T>(n: number): (items: T[]) => T[] {
    return <T>(items: T[]) => R.take(
        Math.min(n, items.length),
        shuffled(items),
    );
}

export function shuffled<T>(items: T[]): T[] {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
        const j = randomBounded(i + 1);
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
    return a;
}
