export function transpose<T>(m: T[][]): T[][] {
    if (!m.length) {
        throw new Error('Outer empty');
    }

    const width = m[0].length;
    if (!width) {
        throw new Error('Inner empty');
    }

    const mT: T[][] = [];
    for (let i = 0; i < m.length; i++) {
        if (m[i].length !== width) {
            throw new Error('Jagged array');
        }
        for (let j = 0; j < width; j++) {
            if (!mT[j]) {
                mT[j] = [];
            }
            mT[j][i] = m[i][j];
        }
    }
    return mT;
}