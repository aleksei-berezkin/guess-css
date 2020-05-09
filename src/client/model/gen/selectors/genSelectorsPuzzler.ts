import { Puzzler } from '../../puzzler';
import { Node, TagNode, TextNode } from '../../nodes';
import { Vector } from 'prelude-ts';
import { randomItem } from '../../../util';
import { genRulesChoices } from './genSelectorsCss';

export function genSelectorsPuzzler(): Puzzler {
    const body = new TagNode(
        'body',
        Vector.empty(),
        Vector.ofIterable(genSiblings(new Context(4), 1))
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
        const hasChildren = level < prob.children.length && Math.random() < prob.children[level];

        if (hasChildren) {
            yield new TagNode('div', classes, Vector.ofIterable(genSiblings(ctx, level + 1)));
        } else {
            ctx.acquire();
            yield new TagNode('div', classes, Vector.of(new TextNode(classes.mkString(' '))));
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
    classes: Vector<string> = Vector.of('a', 'b', 'c');

    constructor() {
    }

    genClasses(): Vector<string> {
        if (Math.random() < .8 / this.classes.length()) {
            this.addOneClass();
        }

        const p = Math.random();
        if (p < .05) {
            return this.classes
                .shuffle()
                .take(2);
        }

        if (p < .9) {
            return Vector.of(this.randomClass());
        }

        return Vector.empty();
    }

    private addOneClass() {
        if (this.classes.last().contains('z')) {
            return;
        }

        this.classes = this.classes.append(
            String.fromCharCode(
                this.classes.last().map(c => c.charCodeAt(0) + 1).getOrThrow()
            )
        );
    }

    private randomClass(): string {
        return randomItem(this.classes);
    }
}
