import { RingBuffer } from './ringBuffer';

export function stream<T>(input: Iterable<T>): Stream<T> {
    return new StreamImpl(input, Base._IDENTITY);
}

export function streamOf<T>(...input: T[]): Stream<T> {
    return new StreamImpl(input, Base._IDENTITY);
}

export function range(from: number, bound: number): Stream<number> {
    return new StreamImpl(function* () {
        for (let i = from; i < bound; i++) {
            yield i;
        }
    }(), Base._IDENTITY);
}

export function same<T>(item: T): Stream<T> {
    return new StreamImpl(function* () {
        for ( ; ; ) {
            yield item;
        }
    }(), Base._IDENTITY);
}

export function continually<T>(getItem: () => T): Stream<T> {
    return new StreamImpl(function* () {
        for ( ; ; ) {
            yield getItem();
        }
    }(), Base._IDENTITY);
}

export function optional<T>(input: Iterable<T>): Optional<T> {
    return new OptionalImpl(trimIterable(input), Base._IDENTITY);
}

export function optionalOfNullable<T>(input: () => T | null | undefined): Optional<T> {
    return new OptionalImpl(function* () {
        const i = input();
        if (i != null) {
            yield i;
        }
    }(), Base._IDENTITY);
}

function* trimIterable<T>(items: Iterable<T>): IterableIterator<T> {
    const n = items[Symbol.iterator]().next();
    if (!n.done) {
        yield n.value;
    }
}

type DetachedStream<I, T> = (input: Iterable<I>) => Stream<T>;

type DetachedOptional<I, T> = (input: Iterable<I>) => Optional<T>;

type DetachedType<I, M> =
    M extends Stream<infer O> ? DetachedStream<I, O> :
    M extends Optional<infer O> ? DetachedOptional<I, O> : never;

function detachedStream<I, M>(make: (base: Stream<I>) => M): DetachedType<I, M> {
    const base = new StreamImpl<I, I>(Base._DETACHED, Base._IDENTITY);
    return _makeDetached(base, make(base));
}

function detachedOptional<I, M>(make: (base: Optional<I>) => M): DetachedType<I, M> {
    const base = new OptionalImpl<I, I>(Base._DETACHED, Base._IDENTITY);
    return _makeDetached(base, make(base));
}

function _makeDetached<I, M>(base: Base<I, I>, made: M): DetachedType<I, M> {
    if (made instanceof Base) {
        if (!made._validate(base)) {
            throw new Error('Make result does not base on provided item. ' +
                'Did you return new Stream/Optional from builder?')
        }
        const attach = ((input: Iterable<I>) => {
            if (base instanceof OptionalImpl) {
                base._attach(trimIterable(input));
            } else {
                base._attach(input);
            }
            return made;
        });
        return attach as any;
    }

    throw new Error('Make returned unknown result: ' + made);
}

abstract class Base<P, T> implements Iterable<T> {
    static readonly _DETACHED: unique symbol = Symbol('Detached Stream/Optional');
    static readonly _IDENTITY: unique symbol = Symbol('Identity operation');

    private readonly attachable: boolean;

    protected constructor(private parent: Iterable<P> | typeof Base._DETACHED,
                          private readonly operation: ((input: Iterable<P>) => Iterable<T>) | typeof Base._IDENTITY) {
        this.attachable = !parent;
    }

    _validate(expectedBase: Iterable<unknown>): boolean {
        if (this.parent === expectedBase) {
            return true;
        }
        if (this.parent instanceof Base) {
            return this.parent._validate(expectedBase);
        }
        return false;
    }

    _attach(items: Iterable<P>): void {
        if (this.parent === Base._DETACHED) {
            this.parent = items as Iterable<P>;
        } else {
            throw new Error('Stream/Optional is already attached');
        }
    }

    _getSource(): Iterable<unknown> {
        if (this.parent instanceof Base) {
            return this.parent._getSource();
        }
        return this.parent as any;
    }

    [Symbol.iterator](): Iterator<T> {
        return this.getItemsTerminal()[Symbol.iterator]();
    }

    size(): number {
        const items = this.getItemsTerminal();
        if (Array.isArray(items)) {
            return items.length;
        }
        let counter = 0;
        for (const _ in items) {
            counter++;
        }
        return counter;
    }

    toArray(): T[] {
        const items = this.getItemsTerminal();
        if (Array.isArray(items) && items !== this._getSource()) {
            return items;
        }
        return [...items];
    }

    private getItemsTerminal(): Iterable<T> {
        if (this.parent === Base._DETACHED) {
            throw new Error('Stream/Optional is not assigned input, call attach() first');
        }
        if (this.operation === Base._IDENTITY) {
            return this.parent as any;
        }
        try {
            return this.operation(this.parent);
        } finally {
            if (this.attachable) {
                this.parent = Base._DETACHED;
            }
        }
    }
}



class StreamImpl<P, T> extends Base<P, T> implements Stream<T> {
    constructor(parent: Iterable<P> | typeof Base._DETACHED,
                operation: ((input: Iterable<P>) => Iterable<T>) | typeof Base._IDENTITY) {
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
            const keys = new Set<any>();
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

    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]> {
        return new StreamImpl(this, function* (items) {
            yield *collectToMap(items, getKey);
        });
    }

    head(): Optional<T> {
        return new OptionalImpl<T, T>(this, trimIterable);
    }

    join(delimiter: string): string {
        let result = '';
        const itr = this[Symbol.iterator]();
        for ( ; ; ) {
            const n = itr.next();
            if (n.done) {
                break;
            }

            if (!result) {
                result = String(n.value);
            } else {
                result += delimiter + String(n.value);
            }
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
        })
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

    zipWithIndex(): Stream<readonly [T, number]> {
        return new StreamImpl(this, function* (items) {
            let index = 0;
            for (const i of items) {
                yield [i, index++] as const;
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
    private static _EMPTY_OPTIONAL = { has: false as const };

    constructor(parent: Iterable<P> | typeof Base._DETACHED,
                operation: ((input: Iterable<P>) => Iterable<T>) | typeof Base._IDENTITY) {
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

    orElseThrow(createError: () => Error): T {
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
        return OptionalImpl._EMPTY_OPTIONAL;
    }

    toStream(): Stream<T> {
        return new StreamImpl(this, OptionalImpl._IDENTITY);
    }
}

type OptionalResolved<T> = { has: true, val: T } | { has: false };

export interface Stream<T> extends Iterable<T> {
    all(predicate: (item: T) => boolean): boolean;
    any(predicate: (item: T) => boolean): boolean;
    at(index: number): Optional<T>;
    append(item: T): Stream<T>;
    appendIf(condition: boolean, item: T): Stream<T>;
    appendAll(items: Iterable<T>): Stream<T>;
    appendAllIf(condition: boolean, items: Iterable<T>): Stream<T>;
    butLast(): Stream<T>;
    distinctBy(getKey: (item: T) => any): Stream<T>;
    equals(other: Iterable<T>): boolean,
    filter(predicate: (item: T) => boolean): Stream<T>;
    find(predicate: (item: T) => boolean): Optional<T>;
    flatMap<U>(mapper: (item: T) => Iterable<U>): Stream<U>;
    groupBy<K>(getKey: (item: T) => K): Stream<readonly [K, T[]]>;
    head(): Optional<T>;
    join(delimiter: string): string;
    last(): Optional<T>;
    map<U>(mapper: (item: T) => U): Stream<U>;
    randomItem(): Optional<T>
    reduce(reducer: (l: T, r: T) => T): Optional<T>;
    reduceLeft<U>(zero: U, reducer: (l: U, r: T) => U): U;
    shuffle(): Stream<T>;
    single(): Optional<T>;
    size(): number;
    sortOn(getComparable: (item: T) => number | string | boolean): Stream<T>
    tail(): Stream<T>;
    take(n: number): Stream<T>;
    takeLast(n: number): Stream<T>;
    transform<U>(transformer: (s: Stream<T>) => U): U;
    toArray(): T[];
    zip<U>(other: Iterable<U>): Stream<readonly [T, U]>;
    zipWithIndex(): Stream<readonly [T, number]>;
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
    orElseThrow(createError: () => Error): T;
    orElseUndefined(): T | undefined;
    resolve(): OptionalResolved<T>
    toArray(): T[];
    toStream(): Stream<T>;
}