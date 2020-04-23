import { Topic } from './topic';
import { Node, TagNode, TextNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { randomItem } from '../../util';

export function genBody(topic: Topic) {
    const classes = (() => { switch (topic) {
        case Topic.SELECTORS: return new RandomClasses();
        case Topic.DISPLAY: return new UniqueClasses();
    }})();
    const texts = new Texts(4);

    return new TagNode(
        'body',
        Vector.empty(),
        Vector.ofIterable(genSiblings('div', { classes, texts }, 1))
    );
}

function *genSiblings(name: string, ctx: Context, level: number, i = 0): IterableIterator<Node> {
    if (Math.random() < siblingsProbabilities[level][i] && ctx.texts.hasNext()) {
        const children = Math.random() < childrenProbabilities[level]
            ? Vector.ofIterable(genSiblings(name, ctx, level + 1))
            : Vector.of(new TextNode(ctx.texts.next()));

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
    classes: Classes;
    texts: Texts;
}

interface Classes {
    genClasses(): Vector<string>;
}

class UniqueClasses implements Classes {
    current: number = 0;

    constructor() {
    }

    genClasses(): Vector<string> {
        return Vector.of(String.fromCharCode('a'.charCodeAt(0) + this.current++));
    }
}

class RandomClasses implements Classes {
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
