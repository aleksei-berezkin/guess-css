export function filter<T>(predicate: (item: T) => boolean) {
    return function* (items: Iterable<T>) {
        for (const i of items) {
            if (predicate(i)) {
                yield i;
            }
        }
    }
}

export function flatMap<T, U>(mapper: (item: T) => Iterable<U>) {
    return function* (items: Iterable<T>) {
        for (const i of items) {
            yield* mapper(i);
        }
    }
}

export function map<T,U>(mapper: (item: T) => U ) {
    return function* (items: Iterable<T>) {
        for (const i of items) {
            yield mapper(i);
        }
    }
}

export class RingBuffer<T> implements Iterable<T>{
    private readonly a: T[];
    private readonly capacity: number;
    private size: number = 0;
    private start: number = 0;
    [Symbol.iterator]: () => Iterator<T>;

    constructor(capacity: number) {
        this.a = [];
        this.capacity = capacity;

        const _this = this;
        this[Symbol.iterator] = function* () {
            for (let i = 0; i < _this.size; i++) {
                yield _this.a[i % _this.capacity];
            }
        };
    }

    add(i: T) {
        if (this.size < this.capacity) {
            this.a[this.size++] = i;
        } else {
            this.a[this.start] = i;
            this.start = (this.start < this.capacity - 1) ? this.start + 1 : 0
        }
    }
}
