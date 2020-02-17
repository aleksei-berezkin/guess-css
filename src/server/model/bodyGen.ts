import { Node, TagNode, TextNode } from './nodes';
import { genCssRulesChoices } from './cssGen';
import * as R from 'ramda';
import { randomItem } from '../../shared/util';
import { Rule } from './cssRules';

export function genPuzzler(): {body: TagNode, rulesChoices: Rule[][]} {
    for ( ; ; ) {
        const body = new TagNode(
            'body',
            [],
            [...genSiblings('div', { classes: new CssClasses(), texts: new Texts(4) }, 1)]
        );

        const rulesChoices = genCssRulesChoices(body);
        if (rulesChoices) {
            return {body, rulesChoices};
        }
    }
}

function *genSiblings(name: string, ctx: Context, level: number): IterableIterator<Node> {
    for (const p of siblingsProbabilities[level]) {
        if (Math.random() > p || !ctx.texts.hasNext()) {
            return;
        }

        const children = level < childrenProbabilities.length && Math.random() < childrenProbabilities[level]
            ? [...genSiblings(name, ctx, level + 1)]
            : [new TextNode(ctx.texts.next())];

        yield new TagNode(name, ctx.classes.genClasses(), children);
    }
}

const siblingsProbabilities: number[][] = [
    [1],    // Not actually used on level 0 (body)
    [1, .9, .4, .15],
    [1, .7, .1],
    [1, .8, .6, .05]
];

const childrenProbabilities: number[] = [
    1,      // Not actually used on level 0 (body)
    .5, .5
];

interface Context {
    classes: CssClasses;
    texts: Texts;
}

class CssClasses {
    readonly classes: string[];

    constructor() {
        this.classes = ['a', 'b', 'c'];
    }

    genClasses(): string[] {
        if (Math.random() < .8 / this.classes.length) {
            this.addOneClass();
        }

        const p = Math.random();
        if (p < .05) {
            const first = this.randomClass();
            const second = randomItem(R.reject(R.equals(first), this.classes));
            return [first, second];
        }

        if (p < .9) {
            return [this.randomClass()];
        }

        return [];
    }

    private addOneClass() {
        if (R.last(this.classes) === 'z') {
            return;
        }

        this.classes.push(String.fromCharCode(R.last(this.classes).charCodeAt(0) + 1));
    }

    private randomClass(): string {
        return randomItem(this.classes);
    }
}

class Texts {
    private counter = 1;
    constructor(private readonly quota) {
    }
    hasNext(): boolean {
        return this.counter <= this.quota;
    }
    next(): string {
        if (this.counter > this.quota) {
            throw new Error('Quota');
        }

        const text = this.counter.toString();
        this.counter++;
        return text;
    }
}
