import { Node, TagNode, TextNode } from './nodes';
import { genCssRulesChoices } from './genCss';
import * as R from 'ramda';
import { randomBounded, randomItem } from '../../shared/util';
import { Puzzler } from './puzzler';
import { Vector } from 'prelude-ts';

export function genPuzzler(): Puzzler {
    const body = new TagNode(
        'body',
        [],
        [...genSiblings('div', { classes: new CssClasses(), texts: new Texts(4) }, 1)]
    );

    const rulesChoices = genCssRulesChoices(body);
    if (rulesChoices) {
        return new Puzzler(body, rulesChoices, randomBounded(rulesChoices.length));
    }

    return genPuzzler();
}

function *genSiblings(name: string, ctx: Context, level: number, i = 0): IterableIterator<Node> {
    if (Math.random() < siblingsProbabilities[level][i] && ctx.texts.hasNext()) {
        const children = Math.random() < childrenProbabilities[level]
            ? [...genSiblings(name, ctx, level + 1)]
            : [new TextNode(ctx.texts.next())];

        yield new TagNode(name, ctx.classes.genClasses(), children);

        yield *genSiblings(name, ctx, level, i + 1);
    }
}

const siblingsProbabilities: number[][] = [
    [1, 0],   // Not actually used on level 0 (body)
    [1, .9, .4, .15, 0],
    [1, .7, .1, 0],
    [1, .8, .6, .05, 0],
    [0],
];

const childrenProbabilities: number[] = [
    1,      // Not actually used on level 0 (body)
    .5, .5, 0
];

interface Context {
    classes: CssClasses;
    texts: Texts;
}

class CssClasses {
    readonly classes: string[] = ['a', 'b', 'c'];

    constructor() {
    }

    genClasses(): string[] {
        if (Math.random() < .8 / this.classes.length) {
            this.addOneClass();
        }

        const p = Math.random();
        if (p < .05) {
            return Vector.ofIterable(this.classes)
                .shuffle()
                .take(2)
                .toArray();
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

        this.classes.push(String.fromCharCode(R.last(this.classes)!.charCodeAt(0) + 1));
    }

    private randomClass(): string {
        return randomItem(this.classes);
    }
}

class Texts {
    private counter = 1;
    constructor(private readonly quota: number) {
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
