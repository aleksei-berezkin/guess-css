export function arraysEqual(a: unknown[], b: unknown[]) {
    return a.length === b.length
        && a.every((v, i) => v === b[i]);
}
