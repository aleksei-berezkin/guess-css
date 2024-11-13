export function single<T>(a: T[]) {
    if (a.length === 1) {
        return a[0];
    }
    throw new Error(`Not single: ${a}`)
}
