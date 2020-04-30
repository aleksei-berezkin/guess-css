import { Topic } from './topic';
import { Node, TagNode, TextNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { randomItem } from '../../util';

export function genBody(topic: Topic) {
    const classes = (() => { switch (topic) {
        case Topic.SELECTORS: return new RandomClasses();
        case Topic.DISPLAY: return new UniqueClasses();
        case Topic.POSITION: return new UniqueClasses();
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
    },
    [Topic.DISPLAY]: {
        siblings: [
            [1],
            [1],
            [1, 1, .5, .5],
        ],
        children: [
            1, 1,
        ],
    },
    [Topic.POSITION]: {
        siblings: [
            [1],
            [1, .8, .5],
            [1, 1, .5, .5],
        ],
        children: [
            1, 1,
        ],
    },
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
