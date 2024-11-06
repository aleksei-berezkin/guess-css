export function randomItem<T>(a: T[]) {
    if (!a.length) {
        throw new Error('Empty a');
    }

    return a[Math.floor(Math.random() * a.length)];
}
