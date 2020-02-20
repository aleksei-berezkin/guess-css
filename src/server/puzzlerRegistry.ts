import * as R from 'ramda';
import { TagNode } from './model/nodes';
import { Rule } from './model/cssRules';
import { randomBounded } from '../shared/util';

interface Storage {
    [k: string]: {puzzler: Puzzler, token: string};
}

export interface Puzzler {
    body: TagNode;
    rulesChoices: Rule[][];
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

    getPuzzlerChoice(id: string, choice: number, token: string): {body: TagNode, rules: Rule[]} | null {
        if (!this.storage.hasOwnProperty(id)) {
            return null;
        }

        const {puzzler, token: actualToken} = this.storage[id];
        if (choice >= puzzler.rulesChoices.length || actualToken !== token) {
            return null;
        }

        return {
            body: puzzler.body,
            rules: puzzler.rulesChoices[choice],
        }
    }
}
