import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { ChildCombinator, ClassSelector, Rule, Selector, TypeSelector } from '../cssRules';
import { randomBounded, randomItem } from '../../util';
import { getSiblingsSubtree, SiblingsSubtree } from './siblingsSubtree';
import { constantRule } from './constantRule';

export function genCssDisplayRulesChoices(body: TagNode): Vector<Vector<Rule>> | null {
    const siblingsSubtree = getSiblingsSubtree(body);
    if (!siblingsSubtree) {
        return null;
    }

    return genSiblingsDisplayRules(siblingsSubtree)
}

function genSiblingsDisplayRules(siblingsSubtree: SiblingsSubtree): Vector<Vector<Rule>> {
    const {path, siblings} = siblingsSubtree.unfold();
    const parentSel = getSelector(path.last().getOrThrow());
    const childrenSel = new ChildCombinator(parentSel, new TypeSelector('*'));

    // TODO 3 different child rules
    const childRule = new Rule(getSelector(randomItem(siblings)), Vector.of(['display', 'block']));

    // TODO parent rules
    // TODO deeper trees
    // TODO Width 50%
    const mainRules = Vector.of(
        new Rule(parentSel, Vector.of(['display', 'flex'])),
        new Rule(childrenSel, Vector.of(['display', 'inline'])),
        new Rule(childrenSel, Vector.of(['display', 'inline-block'])),
    ).shuffle();
    const indexToAddChildRule = randomBounded(mainRules.length());
    return mainRules.zipWithIndex().map(([mainRule, i]) =>
        i === indexToAddChildRule
            ? Vector.of(constantRule, mainRule, childRule)
            : Vector.of(constantRule, mainRule)
    );
}

function getSelector(node: TagNode): Selector {
    if (node.name === 'body') {
        return new TypeSelector('body');
    }
    return new ClassSelector(node.classes.single().getOrThrow());
}
