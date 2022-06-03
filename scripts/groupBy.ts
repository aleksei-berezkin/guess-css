export function groupBy<T, K>(a: T[], getKey: (it: T) => K): [K, T[]][] {
    const map: Map<K, T[]> = new Map();
    for (const it of a) {
        const key = getKey(it);
        if (map.has(key)) {
            map.get(key)!.push(it);
        } else {
            map.set(key, [it]);
        }
    }
    return [...map];
}
