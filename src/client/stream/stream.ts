import { RingBuffer } from './ringBuffer';

export function stream<T>(input: Iterable<T>): Stream<T> {
    return new StreamImpl(input, i => i);
}

export function streamOf<T>(...input: T[]): Stream<T> {
    return new StreamImpl(input, i => i);
}

export function entryStream<O extends {[k: string]: any}>(obj: O): Stream<readonly [keyof O, O[keyof O]]> {
    return new StreamImpl<
            readonly [keyof O, O[keyof O]],
            readonly [keyof O, O[keyof O]]>
    ({
        [Symbol.iterator]() {
            return function* () {
                for (const k of Object.keys(obj)) {
                    yield [k, obj[k]] as const;
                }
            }();
        }
    }, i => i);
}

export function range(from: number, bound: number): Stream<number> {
    return new StreamImpl({
        [Symbol.iterator]() {
            return function* () {
                for (let i = from; i < bound; i++) {
                    yield i;
                }
            }();
        }
    }, i => i);
}

export function abc(): Stream<string> {
    return new StreamImpl({
        [Symbol.iterator]() {
            return function* () {
                let i = 'a'.charCodeAt(0);
                for ( ; ; ) {
                    const s = String.fromCharCode(i++);
                    yield s;
                    if (s === 'z') {
                        break;
                    }
                }
            }();
        }
    }, i => i);
}

export function same<T>(item: T): Stream<T> {
    return new StreamImpl({
        [Symbol.iterator]() {
            return function* () {
                for ( ; ; ) {
                    yield item;
                }
            }();
        }
    }, i => i);
}

export function continually<T>(getItem: () => T): Stream<T> {
    return new StreamImpl({
        [Symbol.iterator]() {
            return function* () {
                for ( ; ; ) {
                    yield getItem();
                }
            }();
        }
    }, i => i);
}

export function optional<T>(input: Iterable<T>): Optional<T> {
    return new OptionalImpl({
        [Symbol.iterator]() {
            return trimIterable(input);
        }
    }, i => i);
}

export function optionalOfNullable<T>(input: () => T | null | undefined): Optional<T> {
    return new OptionalImpl({
        [Symbol.iterator]() {
            return function* () {
                const i = input();
                if (i != null) {
                    yield i;
                }
            }();
        }
    }, i => i);
}

function* trimIterable<T>(items: Iterable<T>): IterableIterator<T> {
    const n = items[Symbol.iterator]().next();
    if (!n.done) {
        yield n.value;
    }
}

abstract class Base<P, T> implements Iterable<T> {
    protected constructor(private parent: Iterable<P>,
                          private readonly operation: (input: Iterable<P>) => Iterable<T>) {
    }

    [Symbol.iterator](): Iterator<T> {
        return this.operation(this.parent)[Symbol.iterator]();
    }

    size(): number {
        let counter = 0;
        for (const _ in this) {
            counter++;
        }
        return counter;
    }

    toArray(): T[] {
        return [...this];
    }
}



class StreamImpl<P, T> extends Base<P, T> implements Stream<T> {
    constructor(parent: Iterable<P>,
                operation: (input: Iterable<P>) => Iterable<T>) {
        super(parent, operation);
    }

    all(predicate: (item: T) => boolean): boolean {
        for (const i of this) {
            if (!predicate(i)) {
                return false;
            }
        }
        return true;
    }

    any(predicate: (item: T) => boolean): boolean {
        for (const i of this) {
            if (predicate(i)) {
                return true;
            }
        }
        return false;
    }

    at(index: number): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            if (index < 0) {
                return;
            }

            if (Array.isArray(items)) {
                if (index < items.length) {
                    yield items[index];
                }
            } else {
                let current = 0;
                for (const i of items) {
                    if (index === current++) {
                        yield i;
                        break;
                    }
                }
            }
        });
    }

    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]> {
        return Promise.all(this) as any;
    }

    append(item: T) {
        return new StreamImpl(this, function* (items) {
            yield *items;
            yield item;
        });
    }

    appendIf(condition: boolean, item: T): Stream<T> {
        return new StreamImpl(this, function* (items) {
            yield *items;
            if (condition) {
                yield item;
            }
        });
    }

    appendAll(newItems: Iterable<T>) {
        return new StreamImpl(this, function* (items) {
            yield *items;
            yield *newItems;
        });
    }

    appendAllIf(condition: boolean, newItems: Iterable<T>): Stream<T> {
        return new StreamImpl(this, function* (items) {
            yield *items;
            if (condition) {
                yield *newItems;
            }
        })
    }

    butLast() {
        return new StreamImpl(this, function* (items) {
            let first = true;
            let prev: T = undefined as any as T;
            for (const i of items) {
                if (!first) {
                    yield prev;
                } else {
                    first = false;
                }
                prev = i;
            }
        });
    }

    distinctBy(getKey: (item: T) => any) {
        return new StreamImpl(this, function* (items) {
            const keys = new Set<T>();
            for (const i of items) {
                const key = getKey(i);
                if (!keys.has(key)) {
                    keys.add(key);
                    yield i;
                }
            }
        });
    }
    
    equals(other: Iterable<T>): boolean {
        const itr = other[Symbol.iterator]();
        for (const i of this) {
            const n = itr.next();
            if (n.done || i !== n.value) {
                return false;
            }
        }
        // noinspection PointlessBooleanExpressionJS
        return !!itr.next().done;
    }

    filter(predicate: (item: T) => boolean) {
        return new StreamImpl(this, function* (items: Iterable<T>) {
            for (const i of items) {
                if (predicate(i)) {
                    yield i;
                }
            }
        });
    }

    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U> {
        return new StreamImpl<T, U>(this, function* (items: Iterable<T>) {
            for (const i of items) {
                if (assertion(i)) {
                    yield i;
                }
            }
        });
    }

    find(predicate: (item: T) => boolean): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            for (const i of items) {
                if (predicate(i)) {
                    yield i;
                    break;
                }
            }
        });
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new StreamImpl(this, function* (items: Iterable<T>) {
            for (const i of items) {
                yield* mapper(i);
            }
        });
    }

    forEach(effect: (item: T) => void) {
        for (const i of this) {
            effect(i);
        }
    }

    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]> {
        return new StreamImpl<T, readonly [K, T[]]>(this, function* (items) {
            yield *collectToMap(items, getKey);
        });
    }

    head(): Optional<T> {
        return new OptionalImpl<T, T>(this, trimIterable);
    }

    join(delimiter: string): string {
        return this.joinBy(() => delimiter);
    }

    joinBy(getDelimiter: (l: T, r: T) => string): string {
        let result = '';
        let prev: T = undefined as any;
        let first = true;
        const itr = this[Symbol.iterator]();
        for ( ; ; ) {
            const n = itr.next();
            if (n.done) {
                break;
            }

            if (first) {
                result = String(n.value);
                first = false;
            } else {
                result += getDelimiter(prev, n.value) + String(n.value);
            }
            prev = n.value;
        }
        return result;
    }

    last(): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            if (Array.isArray(items)) {
                if (items.length) {
                    yield items[items.length - 1];
                }
                return;
            }
            let result: T = undefined as any;
            let found = false;
            for (const i of items) {
                result = i;
                found = true;
            }

            if (found) {
                yield result;
            }
        })
    }

    map<U>(mapper: (item: T) => U) {
        return new StreamImpl(this, function* (items: Iterable<T>) {
            for (const i of items) {
                yield mapper(i);
            }
        });
    }

    randomItem(): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            const a: T[] = Array.isArray(items) ? items : [...items];
            if (a.length) {
                yield a[Math.floor(Math.random() * a.length)];
            }
        });
    }
    
    reduce(reducer: (l: T, r: T) => T): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            let found = false;
            let result: T = undefined as any;
            for (const i of items) {
                if (!found) {
                    result = i;
                    found = true;
                } else {
                    result = reducer(result, i);
                }
            }
            if (found) {
                yield result as T;
            }
        });
    }

    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U {
        let current = zero;
        for (const i of this) {
            current = reducer(current, i);
        }
        return current;
    }

    shuffle(): Stream<T> {
        return new StreamImpl(this, function* (items) {
            const a = [...items];
            for (let i = 0; i < a.length - 1; i++) {
                const j = i + Math.floor(Math.random() * (a.length - i));
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                }
            }
            yield *a;
        });
    }
    
    single(): Optional<T> {
        return new OptionalImpl(this, function* (items) {
            const itr = items[Symbol.iterator]();
            const n = itr.next();
            if (!n.done) {
                if (itr.next().done) {
                    yield n.value;
                }
            }
        });
    }

    sortOn(getComparable: (item: T) => (number | string | boolean)): Stream<T> {
        return new StreamImpl(this, function* (items) {
            const copy = [...items];
            copy.sort((a, b) => {
                if (getComparable(a) < getComparable(b)) {
                    return -1;
                }
                if (getComparable(a) > getComparable(b)) {
                    return 1;
                }
                return 0;
            });
            yield *copy;
        });
    }

    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]> {
        return new StreamImpl(this, function* (items) {
            let chunk: T[] | undefined = undefined;
            for (const item of items) {
                if (!chunk) {
                    chunk = [item];
                } else if (isSplit(chunk[chunk.length - 1], item)) {
                    yield chunk;
                    chunk = [item];
                } else {
                    chunk.push(item);
                }
            }
        });
    }

    tail(): Stream<T> {
        return new StreamImpl(this, function* (items) {
            let first = true;
            for (const i of items) {
                if (first) {
                    first = false;
                } else {
                    yield i;
                }
            }
        });
    }

    take(n: number): Stream<T> {
        return new StreamImpl(this, function* (items) {
            let count = 0;
            for (const i of items) {
                if (count >= n) {
                    return;
                }
                yield i;
                count++;
            }
        });
    }

    takeRandom(n: number): Stream<T> {
        return new StreamImpl(this, function* (items) {
            const a = [...items];
            for (let i = 0; i < Math.min(a.length - 1, n); i++) {
                const j = i + Math.floor(Math.random() * (a.length - i));
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                }
            }
            yield *a.slice(0, Math.min(a.length, n));
        })
    }

    takeLast(n: number): Stream<T> {
        return new StreamImpl(this, function* (items) {
            if (Array.isArray(items)) {
                if (items.length <= n) {
                    return items;
                }
                return items.slice(items.length - n, items.length);
            }

            const buffer = new RingBuffer<T>(n);
            for (const i of items) {
                buffer.add(i);
            }
            yield* buffer;
        });
    }
    
    toObject(): T extends readonly [string, any] ? { [key in T[0]]: T[1] } : never {
        const obj: any = {};
        for (const i of this) {
            if (Array.isArray(i) && i.length === 2) {
                const [k, v] = i;
                if (typeof k === 'string' || typeof  k === 'number' || typeof k === 'symbol') {
                    obj[k] = v;
                } else {
                    throw Error('Not key: ' + k);
                }
            } else {
                throw Error('Not 2-element array: ' + i);
            }
        }
        return obj;
    }

    transform<U>(transformer: (s: Stream<T>) => U): U {
        return transformer(this);
    }

    zip<U>(other: Iterable<U>): Stream<readonly [T, U]> {
        return new StreamImpl(this, function* (items) {
            const oItr = other[Symbol.iterator]();
            for (const i of items) {
                const oNext = oItr.next();
                if (oNext.done) {
                    return;
                }
                yield [i, oNext.value] as const;
            }
        });
    }

    zipStrict<U>(other: Iterable<U>): Stream<readonly [T, U]> {
        // TODO strict
        return this.zip(other);
    }

    zipWithIndex(): Stream<readonly [T, number]> {
        return new StreamImpl(this, function* (items) {
            let index = 0;
            for (const i of items) {
                yield [i, index++] as const;
            }
        });
    }

    zipWithIndexAndLen(): Stream<readonly [T, number, number]> {
        return new StreamImpl(this, function* (items) {
            const a = Array.isArray(items) ? items : [...items];
            let index = 0;
            for (const i of a) {
                yield [i, index++, a.length] as const;
            }
        });
    }
}

function collectToMap<K, T>(items: Iterable<T>, getKey: (item: T) => K) {
    const m = new Map<K, T[]>();
    for (const i of items) {
        const k = getKey(i);
        if (m.has(k)) {
            m.get(k)!.push(i);
        } else {
            m.set(k, [i]);
        }
    }
    return m;
}

class OptionalImpl<P, T> extends Base<P, T> implements Optional<T> {
    constructor(parent: Iterable<P>,
                operation: (input: Iterable<P>) => Iterable<T>) {
        super(parent, operation);
    }

    filter(predicate: (item: T) => boolean): Optional<T> {
        return new OptionalImpl(this, function* (items: Iterable<T>) {
            const n = items[Symbol.iterator]().next();
            if (!n.done && predicate(n.value)) {
                yield n.value;
            }
        });
    }

    has(predicate: (item: T) => boolean): boolean {
        const n = this[Symbol.iterator]().next();
        return !n.done && predicate(n.value);
    }

    hasNot(predicate: (item: T) => boolean): boolean {
        const n = this[Symbol.iterator]().next();
        return n.done || !predicate(n.value);
    }

    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U> {
        return new StreamImpl(this, function* (items: Iterable<T>) {
            const n = items[Symbol.iterator]().next();
            if (!n.done) {
                yield* mapper(n.value);
            }
        });
    }
    
    flatMapTo<U>(mapper: (item: T) => Optional<U>): Optional<U> {
        return new OptionalImpl(this, function* (items) {
            const n = items[Symbol.iterator]().next();
            if (!n.done) {
                const res = mapper(n.value).resolve();
                if (res.has) {
                    yield res.val;
                }
            }
        });
    }    

    get(): T {
        const n = this[Symbol.iterator]().next();
        if (n.done) {
            throw new Error('No value');
        }
        return n.value;
    }

    hasValue(): boolean {
        return !this[Symbol.iterator]().next().done;
    }
    
    is(item: T): boolean {
        const n = this[Symbol.iterator]().next();
        return !n.done && n.value === item;
    }

    map<U>(mapper: (item: T) => U): Optional<U> {
        return new OptionalImpl(this, function* (items: Iterable<T>) {
            const n = items[Symbol.iterator]().next();
            if (!n.done) {
                yield mapper(n.value);
            }
        });
    }

    mapNullable<U>(mapper: (item: T) => (U | null | undefined)): Optional<U> {
        return new OptionalImpl<T, U>(this, function* (items) {
            const n = items[Symbol.iterator]().next();
            if (!n.done) {
                const mapped = mapper(n.value);
                if (mapped != null) {
                    yield mapped;
                }
            }
        });
    }

    orElse<U>(other: U): T | U {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        return other;
    }

    orElseGet<U>(get: () => U): T | U {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        return get();
    }

    orElseNull(): T | null {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        return null;
    }

    orElseThrow(createError: () => Error = () => new Error('Empty optional')): T {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        throw createError();
    }

    orElseUndefined(): T | undefined {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return n.value;
        }
        return undefined;
    }
    
    resolve(): OptionalResolved<T> {
        const n = this[Symbol.iterator]().next();
        if (!n.done) {
            return { has: true, val: n.value };
        }
        return { has: false as const };
    }

    toStream(): Stream<T> {
        return new StreamImpl(this, i => i);
    }
}

type OptionalResolved<T> = { has: true, val: T } | { has: false };

export interface Stream<T> extends Iterable<T> {
    all(predicate: (item: T) => boolean): boolean;
    any(predicate: (item: T) => boolean): boolean;
    at(index: number): Optional<T>;
    awaitAll(): Promise<T extends PromiseLike<infer E> ? E[] : T[]>;
    append(item: T): Stream<T>;
    appendIf(condition: boolean, item: T): Stream<T>;
    appendAll(items: Iterable<T>): Stream<T>;
    appendAllIf(condition: boolean, items: Iterable<T>): Stream<T>;
    butLast(): Stream<T>;
    distinctBy(getKey: (item: T) => any): Stream<T>;
    equals(other: Iterable<T>): boolean,
    filter(predicate: (item: T) => boolean): Stream<T>;
    filterWithAssertion<U extends T>(assertion: (item: T) => item is U): Stream<U>;
    find(predicate: (item: T) => boolean): Optional<T>;
    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U>;
    forEach(effect: (item: T) => void): void;
    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]>;
    head(): Optional<T>;
    join(delimiter: string): string;
    joinBy(getDelimiter: (l: T, r: T) => string): string;
    last(): Optional<T>;
    map<U>(mapper: (item: T) => U): Stream<U>;
    randomItem(): Optional<T>
    reduce(reducer: (l: T, r: T) => T): Optional<T>;
    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U;
    shuffle(): Stream<T>;
    single(): Optional<T>;
    size(): number;
    sortOn(getComparable: (item: T) => number | string | boolean): Stream<T>
    splitWhen(isSplit: (l: T, r: T) => boolean): Stream<T[]>;
    tail(): Stream<T>;
    take(n: number): Stream<T>;
    takeRandom(n: number): Stream<T>;
    takeLast(n: number): Stream<T>;
    transform<U>(transformer: (s: Stream<T>) => U): U;
    toArray(): T[];
    toObject(): T extends readonly [string, any] ? { [key in T[0]]: T[1] } : never;
    zip<U>(other: Iterable<U>): Stream<readonly [T, U]>;
    zipStrict<U>(other: Iterable<U>): Stream<readonly [T, U]>
    zipWithIndex(): Stream<readonly [T, number]>;
    zipWithIndexAndLen(): Stream<readonly [T, number, number]>;
}

export interface Optional<T> extends Iterable<T> {
    filter(predicate: (item: T) => boolean): Optional<T>;
    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U>;
    flatMapTo<U>(mapper: (item: T) => Optional<U>): Optional<U>;
    get(): T;
    has(predicate: (item: T) => boolean): boolean;
    hasNot(predicate: (item: T) => boolean): boolean;
    hasValue(): boolean;
    is(item: T): boolean;
    map<U>(mapper: (item: T) => U): Optional<U>;
    mapNullable<U>(mapper: (item: T) => U | null | undefined): Optional<U>;
    orElse<U>(other: U): T | U;
    orElseGet<U>(get: () => U): T | U;
    orElseNull(): T | null;
    orElseThrow(createError?: () => Error): T;
    orElseUndefined(): T | undefined;
    resolve(): OptionalResolved<T>
    toArray(): T[];
    toStream(): Stream<T>;
}
