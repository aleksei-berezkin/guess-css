export function combineClasses(...pairs: [
    predicate: boolean | undefined | null,
    className: string
][]) {
    return pairs
        .filter(([predicate]) => !!predicate)
        .map(([,className]) => className)
        .join(' ')
}
