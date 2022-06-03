import { letterByIndex } from './letterByIndex';

export function abc(n: number) {
    return Array.from({length: n})
        .map((_, i) => letterByIndex(i));
}
