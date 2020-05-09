import { Topic } from './topic';
import { Node, TagNode, TextNode } from '../nodes';
import { Vector } from 'prelude-ts';

export function genBody(topic: Topic) {
    const classes = (() => { switch (topic) {
        case Topic.SELECTORS: throw new Error();
        case Topic.DISPLAY: throw new Error();
        case Topic.POSITION: return new UniqueClasses();
        case Topic.FLEXBOX: return new UniqueClasses();
    }})();
    const texts = new Texts(4);

    return new TagNode(
        'body',
        Vector.empty(),
        Vector.ofIterable(genSiblings(topic, 'div', { classes, texts }, 1))
    );
}

function *genSiblings(topic: Topic, name: string, ctx: Context, level: number, i = 0): IterableIterator<Node> {
    const prob = probabilities[topic];
    if (ctx.texts.hasNext() && i < prob.siblings[level].length && Math.random() < prob.siblings[level][i]) {
        const children = level < prob.children.length && Math.random() < prob.children[level]
            ? Vector.ofIterable(genSiblings(topic, name, ctx, level + 1))
            : Vector.of(new TextNode(ctx.texts.next()));

        yield new TagNode(name, ctx.classes.genClasses(), children);

        yield *genSiblings(topic, name, ctx, level, i + 1);
    }
}

type Probabilities = {
    siblings: number[][];
    children: number[];
};

const probabilities: {[k in Topic]: Probabilities} = {
    [Topic.SELECTORS]: {
        // TODO remove
        siblings: [],
        children: [],
    },
    [Topic.DISPLAY]: {
        // TODO remove
        siblings: [],
        children: [],
    },
    [Topic.POSITION]: {
        siblings: [
            [1],
            [1],
            [1, 1, .5, .5],
        ],
        children: [
            1, 1,
        ],
    },
    [Topic.FLEXBOX]: {
        siblings: [
            [1],
            [1, 1, .5, .5],
        ],
        children: [
            1,
        ]
    }
};

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
