import { shuffleFirstInPlace } from './shuffleFirstInPlace';

export function shuffle<T>(a: T[]) {
    const b = [...a];
    shuffleFirstInPlace(b, a.length);
    return b;
}
