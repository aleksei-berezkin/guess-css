import { Puzzler } from '../../puzzler';
import { Node, TagNode, TextNode } from '../../nodes';
import { randomItem } from '../../../util';
import { genRulesChoices } from './genSelectorsCss';
import { stream } from 'fluent-streams';

export function genSelectorsPuzzler(): Puzzler {
    const body = new TagNode(
        'body',
        [],
        [...genSiblings(new Context(4), 1)],
    );
    const rulesChoices = genRulesChoices(body);
    if (!rulesChoices) {
        return genSelectorsPuzzler();
    }

    return new Puzzler(body, rulesChoices);
}

function *genSiblings(ctx: Context, level: number, i = 0): IterableIterator<Node> {
    if (ctx.hasQuotaLeft() && i < prob.siblings[level].length && Math.random() < prob.siblings[level][i]) {
        const classes = ctx.classes.genClasses();
        const text = classes.join(' ');
        const hasChildren = level < prob.children.length && Math.random() < prob.children[level];

        if (hasChildren) {
            yield new TagNode('div', classes, [new TextNode(text + ' '), ...genSiblings(ctx, level + 1)]);
        } else {
            ctx.acquire();
            yield new TagNode('div', classes, [new TextNode(text)]);
        }

        yield *genSiblings(ctx, level, i + 1);
    }
}

const prob = {
    siblings: [
        [1],   // Not actually used on level 0 (body)
        [1, .9, .4, .15],
        [1, .7, .1],
        [1, .8, .6, .05],
    ],
    children: [
        1,      // Not actually used on level 0 (body)
        .5, .5,
    ],
};

class Context {
    readonly classes = new Classes();

    constructor(private quota: number) {
    }

    hasQuotaLeft(): boolean {
        return this.quota > 0;
    }

    acquire() {
        if (!this.hasQuotaLeft()) {
            throw new Error('No quota');
        }
        this.quota--;
    }
}

class Classes {
    classes: string[] = ['a', 'b', 'c'];

    constructor() {
    }

    genClasses(): string[] {
        if (Math.random() < .8 / this.classes.length) {
            this.addOneClass();
        }

        const p = Math.random();
        if (p < .05) {
            return stream(this.classes)
                .takeRandom(2)
                .toArray();
        }

        return [this.randomClass()];
    }

    private addOneClass() {
        if (stream(this.classes).last().is('z')) {
            return;
        }

        this.classes = [
            ...this.classes,
            stream(this.classes).last().map(c => String.fromCharCode(c.charCodeAt(0) + 1)).get(),
        ]; 
    }

    private randomClass(): string {
        return randomItem(this.classes);
    }
}
