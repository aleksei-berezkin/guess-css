export function combineClasses(...pairs: [boolean | undefined | null, string][]) {
    return pairs
        .filter(([predicate]) => !!predicate)
        .map(([,className]) => className)
        .join(' ')
}