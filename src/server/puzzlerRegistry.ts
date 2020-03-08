import * as R from 'ramda';
import { randomBounded } from '../shared/util';
import { Puzzler } from './model/puzzler';

interface Storage {
    [id: string]: {puzzler: Puzzler, token: string};
}

const MAX_ITEMS = 20;

export class Registry {
    private storage: Storage = {};
    private counter: number = 0;

    constructor() {
        setInterval(() => this.cleanOldEntries(), 10_000);
    }

    cleanOldEntries() {
        const keys: string[] = Object.keys(this.storage);
        if (keys.length <= MAX_ITEMS) {
            return;
        }

        const itemsToClear = keys.length - MAX_ITEMS;
        R.pipe(
            R.take(itemsToClear) as (keys: string[]) => string[],
            R.forEach((key: string) => delete this.storage[key])
        )(keys);
        console.log(`Puzzler registry: cleared ${ itemsToClear } entries`);
    }

    putPuzzler(puzzler: Puzzler): {id: string, token: string} {
        const id = this.counter.toString(10);
        const token = randomBounded(Number.MAX_SAFE_INTEGER).toString(10);
        this.storage[id] = {puzzler, token};
        this.counter++;
        return {id, token};
    }

    getPuzzler(id: string, token: string): Puzzler | null {
        if (!this.storage.hasOwnProperty(id)) {
            return null;
        }

        const {puzzler, token: storedToken} = this.storage[id];
        if (storedToken === token) {
            return puzzler;
        }

        return null;
    }
}
