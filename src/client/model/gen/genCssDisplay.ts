import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { ClassSelector, Rule, Selector, TypeSelector } from '../cssRules';
import { randomBounded, randomItemsInOrder } from '../../util';
import { getSiblingsSubtree } from './siblingsSubtree';

const borderStyle: [string, string, boolean?] = ['border', '4px solid blue'];

export function genCssDisplay(body: TagNode): Vector<Vector<Rule>> | null {
    const {path, siblings} = getSiblingsSubtree(body)!.unfold();
    const {displaysShuffled1, displaysShuffled2, displaysShuffled3} = getDisplaysShuffled();

    const parentSelector = getSelector(path.last().getOrThrow());
    const parentRules = displaysShuffled1
        .map(d => new Rule(parentSelector, Vector.of(
            ['display', d, true],
            ['background-color', 'pink']
        )));

    const someChildren = randomItemsInOrder(siblings, randomBounded(1, siblings.length()));
    const otherChildren = siblings.filter(n => someChildren.find(m => n === m).isNone());

    const someChildrenSelectors = someChildren.map(getSelector);
    const someChildrenRules = displaysShuffled2
        .map(d => new Rule(someChildrenSelectors, Vector.of(
            ['display', d, true],
            borderStyle,
        )));

    const otherChildrenSelectors = otherChildren.map(getSelector);
    const width = `${ 5 * randomBounded(6, 17) }%`;
    const otherChildrenRules = displaysShuffled3
        .map(d => new Rule(otherChildrenSelectors, Vector.of(
            ['display', d, true],
            borderStyle,
            ['width', width]
        )));

    return parentRules.zip(someChildrenRules).zip(otherChildrenRules)
        .map(([[parent, child], otherChild]) => Vector.of(parent, child, otherChild));
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


function getSelector(node: TagNode): Selector {
    if (node.name === 'body') {
        return new TypeSelector('body');
    }
    return new ClassSelector(node.classes.single().getOrThrow());
}
