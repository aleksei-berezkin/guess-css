import * as R from 'ramda';
import { nRandom, randomSeqItem, shuffled, twoElementVariationsInOrder, xprod } from '../../shared/util';
import { TagNode } from './nodes';
import {
    ChildCombinator,
    ClassSelector,
    DescendantCombinator,
    PseudoClassSelector,
    Rule,
    Selector,
    TypeSelector
} from './cssRules';
import { Option, Vector } from 'prelude-ts';

const constantRule = new Rule(new TypeSelector('div'), {'padding': '6px', 'border': '1px solid black'});

const RULES_CHOICES = 3;

const colors = ['pink', 'lightgreen', 'lightblue', 'cyan', 'magenta', 'yellow', 'lightgrey'];

export function genCssRulesChoices(body: TagNode): Rule[][] | null {
    const styles: {[k: string]: string}[] = R.pipe(
        nRandom<string>(2),
        R.map((color: string) => ({'background-color': color})),
    )(colors);

    const deepest: SingleChildSubtree = getDeepestSingleChildSubtree(body);
    const deepChildRules = genDeepChildRules(deepest, styles[0]);
    if (deepChildRules.length < RULES_CHOICES) {
        return null;
    }

    const siblingsSubtree = getSiblingsSubtree(body);
    if (!siblingsSubtree) {
        return null;
    }

    const siblingsRules = [...genSiblingsRules(siblingsSubtree, styles[1])];
    if (siblingsRules.length < RULES_CHOICES) {
        return null;
    }

    const shuffledDeepRules = shuffled(deepChildRules);
    const shuffledSiblingRules = shuffled(siblingsRules);

    return R.pipe(
        R.range(0),
        R.map((i: number) => [constantRule, shuffledDeepRules[i], shuffledSiblingRules[i]]),
    )(RULES_CHOICES);
}

function getDeepestSingleChildSubtree(root: TagNode): SingleChildSubtree {
    if (!root.tagChildren.length) {
        return new SingleChildSubtree(root);
    }

    const deepestChildren: Vector<SingleChildSubtree> = root.tagChildrenVector
        .map(getDeepestSingleChildSubtree)
        .groupBy(subtree => subtree.depth)
        .reduce(([d1, s1], [d2, s2]) => d1 > d2 ? [d1, s1] : [d2, s2])
        .map(([_, s]) => s)
        .getOrThrow();

    return randomSeqItem(deepestChildren).createWithParent(root);
}

class SingleChildSubtree {
    constructor(readonly root: TagNode, readonly depth: number = 1) {
        if (depth < 1) {
            throw new Error('Bad ' + depth);
        }
        if (root.children.length > 1) {
            throw new Error('Not single child: ' + root.children);
        }
    }

    createWithParent(parent: TagNode): SingleChildSubtree {
        return new SingleChildSubtree(parent.copyWithSingleChild(this.root), this.depth + 1);
    }

    unfold(): Vector<TagNode> {
        return Vector.unfoldRight<TagNode | undefined, TagNode>(
            this.root,
            n => Option.of(n).map(n => [n, n.tagChildrenVector.single().getOrUndefined()])
        );
    }
}

function getSiblingsSubtree(root: TagNode): SiblingsSubtree | null {
    if (!root.tagChildren.length) {
        return null;
    }

    const childrenSubtrees = root.tagChildrenVector
        .map(getSiblingsSubtree)
        .filter(s => s != null) as Vector<SiblingsSubtree>

    if (childrenSubtrees.length()) {
        return randomSeqItem(childrenSubtrees).createWithParent(root);
    }

    if (root.tagChildren.length > 1) {
        return new SiblingsSubtree(root);
    }

    return null;
}

class SiblingsSubtree {
    constructor(readonly root: TagNode, readonly depth: number = 1) {
        if (depth < 1) {
            throw new Error('Bad ' + depth);
        } else if (depth === 1) {
            if (root.children.length < 2) {
                throw new Error('Siblings expected on the deepest level: ' + root.children);
            }
        } else {
            if (root.children.length !== 1) {
                throw new Error('Siblings cannot be on levels other than deeper: ' + root.children);
            }
        }
    }

    createWithParent(parent: TagNode): SiblingsSubtree {
        return new SiblingsSubtree(parent.copyWithSingleChild(this.root), this.depth + 1);
    }

    unfold(): {path: TagNode[], siblings: TagNode[]} {
        const path = R.unfold((n: TagNode | null) => {
            if (!n) {
                return false;
            }
            if (n.tagChildren.length > 1) {
                return [n, null];
            }
            return [n, n.tagChildren[0]];
        })(this.root);

        if (!path.length) {
            return {path:[], siblings: []};
        }

        return {path, siblings: R.last(path)!.tagChildren};
    }
}

function genDeepChildRules(deepest: SingleChildSubtree, style: {[p: string]: string}): Rule[] {
    const path: Vector<TagNode> = deepest.unfold().filter(n => n.name !== 'body');

    if (path.length() === 0) {
        return [];
    }

    if (path.length() === 1) {
        return path.take(1)
            .flatMap(genAllPossibleSelectors)
            .map(s => new Rule(s, style))
            .toArray()
    }

    return twoElementVariationsInOrder(path)
        .flatMap(([ancestor, descendant]) =>
            xprod(genAllPossibleSelectors(ancestor), genAllPossibleSelectors(descendant))
        )
        .flatMap(([ancestorSelector, descendantSelector]) => Vector.of(
            new Rule(new DescendantCombinator(ancestorSelector, descendantSelector), style, true),
            new Rule(new ChildCombinator(ancestorSelector, descendantSelector), style, true)
        ))
        .toArray();
}

function *genSiblingsRules(siblingsSubtree: SiblingsSubtree, style: {[k: string]: string}): IterableIterator<Rule> {
    const pathAndSiblings = siblingsSubtree.unfold();
    const path = R.reject(n => n.name === 'body', pathAndSiblings.path);
    const siblings = pathAndSiblings.siblings;
    if (!path.length || !siblings.length) {
        return;
    }

    if (allSameName(siblings)) {
        const innerSelectors = genAllPossiblePseudoClassSelectors(siblings[0].name);
        yield *innerSelectors.map(s => new Rule(s, style, true));

        if (path.length) {
            yield *Vector.ofIterable(path)
                .flatMap(genAllPossibleSelectors)
                .flatMap(ancestorSelector =>
                    innerSelectors.map(innerSelector =>
                        new Rule(new DescendantCombinator(ancestorSelector, innerSelector), style, true)
                    )
                );
        }
    }

    if (path.length) {
        yield *genAllPossibleSelectors(R.last(path)!)
            .map(selector => new Rule(new ChildCombinator(selector, new TypeSelector('*')), style, true));
    }

    yield *Vector.ofIterable(siblings)
        .flatMap(n => Vector.ofIterable(n.classList))
        .distinctBy(_ => _)
        .map(clazz => new Rule(new ClassSelector(clazz), style, true))
}

function genAllPossibleSelectors(node: TagNode): Vector<Selector> {
    if (node.classList.length) {
        return Vector.ofIterable(node.classList)
            .map(c => new ClassSelector(c));
    }

    return Vector.of(new TypeSelector(node.name));
}

function genAllPossiblePseudoClassSelectors(name: string): Vector<Selector> {
    const baseSelector = new TypeSelector(name);
    return Vector.of(
        new PseudoClassSelector(baseSelector, 'first-child'),
        new PseudoClassSelector(baseSelector, 'last-child')
    );
}

function allSameName(nodes: TagNode[]) {
    return R.all(n => n.name === nodes[0].name, nodes);
}
