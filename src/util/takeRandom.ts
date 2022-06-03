import { shuffleFirstInPlace } from './shuffleFirstInPlace';

export function takeRandom<T>(a: T[], n: number) {
    const b = [...a];
    shuffleFirstInPlace(b, n);
    return b.slice(0, n);
}
