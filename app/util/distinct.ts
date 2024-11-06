import { distinctBy } from './distinctBy';

export function distinct<T>(a: T[]) {
    return distinctBy(a, _ => _);
}
