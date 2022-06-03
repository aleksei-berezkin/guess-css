export function shuffleFirstInPlace<T>(a: T[], n: number) {
    const bound = n < a.length ? n : a.length - 1;
    for (let i = 0; i < bound; i++) {
        const j = i + Math.floor(Math.random() * (a.length - i));
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}
