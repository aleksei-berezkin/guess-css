export function distinctBy<T>(a: T[], getVal: (a: T) => unknown): T[] {
    const distinctVals = new Set<unknown>();
    const res: T[] = [];
    for (const it of a) {
        const val = getVal(it);
        if (!distinctVals.has(val)) {
            distinctVals.add(val);
            res.push(it);
        }
    }
    return res;
}
