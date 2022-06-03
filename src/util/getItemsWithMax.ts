export function getItemsWithMax<T>(a: T[], getVal: (it: T) => number): T[] {
    let maxVal = Number.NEGATIVE_INFINITY;
    let maxItems: T[] = [];
    for (const it of a) {
        const val = getVal(it);
        if (val > maxVal) {
            maxVal = val;
            maxItems = [it];
        } else if (val === maxVal) {
            maxItems.push(it);
        }
    }
    return maxItems;
}
