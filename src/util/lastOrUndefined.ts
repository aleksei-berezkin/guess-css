export function lastOrUndefined<T>(a: T[]) {
    return a.length ? a[a.length - 1] : undefined;
}
