import { range, Stream, stream } from 'fluent-streams';
import { Theme } from '@material-ui/core';

export function randomItem<T>(items: T[]): T {
    return items[randomBounded(items.length)];
}

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
        .sortOn(i => i)
        .map(i => items[i])
        .toArray();
}

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

export function transpose<T>(m: T[][]): T[][] {
    if (!m.length) {
        throw new Error('Outer empty');
    }

    const width = m[0].length;
    if (!width) {
        throw new Error('Inner empty')
    }

    const mT: T[][] = [];
    for (let i = 0; i < m.length; i++) {
        if (m[i].length !== width) {
            throw new Error('Jagged array');
        }
        for (let j = 0; j < width; j++) {
            if (!mT[j]) {
                mT[j] = [];
            }
            mT[j][i] = m[i][j];
        }
    }
    return mT;
}

export type ItemType<T> = T extends Array<infer E> ? E : never;

export function singleRe(re: string) {
    return new RegExp(escapeRe(re));
}

export function globalRe(re: string) {
    return new RegExp(escapeRe(re), 'g');
}

export function escapeRe(re: string) {
    return re.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

export function ld(light: string, dark: string, theme: Theme) {
    return theme.palette.type === 'light' ? light : dark;
}

export const monospaceFontsLines = ['Menlo,', '"Ubuntu Mono", Consolas,', 'source-code-pro, monospace'];
export const monospaceFonts = monospaceFontsLines.join(' ');
