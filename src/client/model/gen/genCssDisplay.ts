import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { ClassSelector, Rule, Selector, TypeSelector } from '../cssRules';
import { randomBounded, randomItemsInOrder } from '../../util';
import { getSiblingsSubtree } from './siblingsSubtree';

export function genCssDisplay(body: TagNode): Vector<Vector<Rule>> | null {
    const {path, siblings} = getSiblingsSubtree(body)!.unfold();
    const {displaysShuffled1, displaysShuffled2, displaysShuffled3} = getDisplaysShuffled();

    const parentSelector = getSelector(path.last().getOrThrow());
    const parentRules = displaysShuffled1
        .map(d => new Rule(parentSelector, Vector.of(
            ['display', d, true],
            ['background-color', 'pink']
        )));

    const [children1, children2] = splitChildren(siblings);

    const [width1, width2] = Vector.of(`${ 5 * randomBounded(6, 17) }%`, undefined).shuffle();

    const children1Rules = displaysShuffled2.map(childrenToRule(children1, width1));
    const children2Rules = displaysShuffled3.map(childrenToRule(children2, width2));

    return parentRules.zip(children1Rules).zip(children2Rules)
        .map(([[ruleParent, rule1], rule2]) => Vector.of(ruleParent, rule1, rule2));
}

const displays = Vector.of('inline', 'block', 'inline-block');

export function getDisplaysShuffled() {
    const displaysShuffled1 = displays.shuffle();
    const displaysShuffled2 = (function shuffle2(): Vector<string> {
        const _shuffled2 = displays.shuffle();
        if (displaysShuffled1.equals(_shuffled2)) {
            return shuffle2();
        }
        return _shuffled2;
    })();
    const displaysShuffled3 = (function shuffle3(): Vector<string> {
        const _shuffled3 = displays.shuffle();
        if (displaysShuffled1.equals(_shuffled3) || displaysShuffled2.equals(_shuffled3)) {
            return shuffle3();
        }
        return _shuffled3;
    })();
    return { displaysShuffled1, displaysShuffled2, displaysShuffled3 };
}


function splitChildren(children: Vector<TagNode>): [Vector<TagNode>, Vector<TagNode>] {
    if (children.length() < 2) {
        throw Error('Length=' + children.length());
    }

    const someChildren = randomItemsInOrder(children, randomBounded(1, children.length()));
    const otherChildren = children.filter(n => someChildren.find(m => n === m).isNone());

    // It's more convenient when order of rules is similar to the order of children, at least for first
    if (someChildren.head().getOrThrow().classes < otherChildren.head().getOrThrow().classes) {
        return [someChildren, otherChildren];
    }
    return [otherChildren, someChildren];
}

function childrenToRule(children: Vector<TagNode>, width: string | undefined): (display: string) => Rule {
    return display => new Rule(
        children.map(getSelector),
        Vector.of<[string, string, boolean?]>(
            ['display', display, true],
            ['border', '4px solid blue'],
        ).transform(
            decl => width ? decl.append(['width', width]) : decl
        )
    );
}

function getSelector(node: TagNode): Selector {
    if (node.name === 'body') {
        return new TypeSelector('body');
    }
    return new ClassSelector(node.classes.single().getOrThrow());
}
