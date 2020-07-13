export function ringBuffer<T>(capacity: number): Iterable<T> & { add(item: T): void } {
    const a: T[] = [];
    let size = 0;
    let start = 0;

    return {
        [Symbol.iterator](): Iterator<T> {
            return function*() {
                for (let i = 0; i < size; i++) {
                    yield a[(start + i) % capacity];
                }
            }();
        },

        add(item: T) {
            if (size < capacity) {
                a[size++] = item;
            } else {
                a[start] = item;
                start = (start < capacity - 1) ? start + 1 : 0
            }
        }
    };
}
