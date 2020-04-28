import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { ChildCombinator, ClassSelector, Rule, Selector, TypeSelector } from '../cssRules';
import { randomBounded, randomItemsInOrder } from '../../util';
import { getSiblingsSubtree } from './siblingsSubtree';
import { constantRule } from './constantRule';

export function genCssDisplaySimple(body: TagNode): Vector<Vector<Rule>> | null {
    const {path, siblings} = getSiblingsSubtree(body)!.unfold();
    const {displaysShuffled, displaysShuffledDifferently} = getDisplaysShuffled();

    const allChildrenSelector = new ChildCombinator(getSelector(path.last().getOrThrow()), new TypeSelector('*'));
    const mainRules = displaysShuffled
        .map(d => new Rule(allChildrenSelector, Vector.of(['display', d, true], ['width', '25%'])));

    const someChildrenSelectors = randomItemsInOrder(siblings, randomBounded(1, siblings.length())).map(getSelector);
    const someChildrenRules = displaysShuffledDifferently
        .map(d => new Rule(someChildrenSelectors, Vector.of(['display', d, true])));

    return mainRules.zip(someChildrenRules).map(([main, child]) => Vector.of(constantRule, main, child));
}

export function genCssDisplayWithParent(body: TagNode): Vector<Vector<Rule>> | null {
    const {path, siblings} = getSiblingsSubtree(body)!.unfold();
    const {displaysShuffled, displaysShuffledDifferently} = getDisplaysShuffled();

    const parentSelector = getSelector(path.last().getOrThrow());
    const parentRules = displaysShuffled
        .map(d => new Rule(parentSelector, Vector.of(
            ['display', d, true],
            ['background-color', 'pink']
        )));

    const someChildren = randomItemsInOrder(siblings, randomBounded(1, siblings.length()));
    const otherChildren = siblings.filter(n => someChildren.find(m => n === m).isNone());

    const someChildrenSelectors = someChildren.map(getSelector);
    const someChildrenRules = displaysShuffledDifferently
        .map(d => new Rule(someChildrenSelectors, Vector.of(
            ['display', d, true],
            ['border', '4px solid blue']
        )));

    const otherChildrenSelectors = otherChildren.map(getSelector);
    const width = `${ 5 * randomBounded(6, 17) }%`;
    const otherChildrenRules = displaysShuffled.shuffle()
        .map(d => new Rule(otherChildrenSelectors, Vector.of(
            ['display', d, true],
            ['border', '4px solid blue'],
            ['width', width]
        )));

    return parentRules.zip(someChildrenRules).zip(otherChildrenRules)
        .map(([[parent, child], otherChild]) => Vector.of(parent, child, otherChild));
}

const displays = Vector.of('inline', 'block', 'inline-block');

export function getDisplaysShuffled() {
    const displaysShuffled = displays.shuffle();
    const displaysShuffledDifferently = (function shuffleDifferently(): Vector<string> {
        const _shuffled = displays.shuffle();
        if (displaysShuffled.zip(_shuffled).find(([a, b]) => a === b).isSome()) {
            return shuffleDifferently();
        }
        return _shuffled;
    })();
    return { displaysShuffled, displaysShuffledDifferently };
}


function getSelector(node: TagNode): Selector {
    if (node.name === 'body') {
        return new TypeSelector('body');
    }
    return new ClassSelector(node.classes.single().getOrThrow());
}
