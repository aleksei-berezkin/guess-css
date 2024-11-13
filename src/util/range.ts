export function range(bound: number) {
    return rangeFromTo(0, bound);
}

export function rangeFromTo(from: number, bound: number) {
    return Array.from({length: bound - from}).map((_, i) => from + i);
}
