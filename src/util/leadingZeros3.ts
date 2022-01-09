export function leadingZeros3(a: number) {
    if (a < 0 || !Number.isInteger(a)) {
        return String(a);
    }
    if (a <= 9) {
        return `00${a}`;
    }
    if (a <= 99) {
        return `0${a}`;
    }
    return String(a);
}
