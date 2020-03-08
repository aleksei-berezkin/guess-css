import * as R from 'ramda';
import { randomBounded } from '../shared/util';
import { Puzzler } from './model/puzzler';

export interface Registry {
    putPuzzler(puzzler: Puzzler): {id: string, token: string};
    getPuzzler(id: string, token: string): Puzzler | null;
}

class RegistryImpl implements Registry {
    private readonly MAX_ITEMS = 20;
    private storage: {[id: string]: {puzzler: Puzzler, token: string}} = {};
    private counter: number = 0;

    constructor() {
        setInterval(() => this.cleanOldEntries(), 10_000);
    }

    private cleanOldEntries() {
        const keys: string[] = Object.keys(this.storage);
        if (keys.length <= this.MAX_ITEMS) {
            return;
        }

        const itemsToClear = keys.length - this.MAX_ITEMS;
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

export const theRegistry = new RegistryImpl();
