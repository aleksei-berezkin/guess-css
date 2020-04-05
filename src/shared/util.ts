import { take } from 'ramda';
import { Option, Vector } from 'prelude-ts';

export function randomVectorItem<T>(items: Vector<T>): T {
    return items.get(randomBounded(items.length())).getOrThrow();
}

export function randomItem<T>(items: T[]): T {
    if (!items || !items.length) {
        throw new Error('Bad items: ' + items);
    }
    return items[randomBounded(items.length)];
}

export function randomBounded(bound: number): number {
    return Math.floor(Math.random() * bound);
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

export function nRandom<T>(n: number): (items: T[]) => T[] {
    return <T>(items: T[]) => take(
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

export function xprod<T>(a: Vector<T>, b: Vector<T>): Vector<[T, T]> {
    return a.flatMap(a => b.map(b => [a, b]));
}
