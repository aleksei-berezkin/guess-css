import * as R from 'ramda';
import { TagNode } from './model/nodes';
import { Rule } from './model/cssRules';

interface Storage {
    [k: string]: Puzzler;
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

    putPuzzler(puzzler: Puzzler): string {
        const key = this.counter.toString(10);
        this.storage[key] = puzzler;
        this.counter++;
        return key;
    }

    getPuzzlerChoice(id: string, choice: number): {body: TagNode, rules: Rule[]} | null {
        const puzzler = this.storage[id];
        if (!puzzler || choice >= puzzler.rulesChoices.length) {
            return null;
        }

        return {
            body: puzzler.body,
            rules: puzzler.rulesChoices[choice],
        }
    }
}
