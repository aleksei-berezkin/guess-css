import * as R from 'ramda';
import { nRandom, randomItem, shuffled, twoElementVariationsInOrder } from '../../shared/util';
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

    const oneOfDeepestChildren: SingleChildSubtree = R.pipe(
        R.map(getDeepestSingleChildSubtree),
        R.sortBy(nd => nd.depth),
        R.groupWith((l, r) => l.depth === r.depth),
        R.takeLast(1) as {(s: SingleChildSubtree[][]): SingleChildSubtree[][]},
        R.unnest,
        randomItem
    )(root.tagChildren);

    return oneOfDeepestChildren.createWithParent(root);
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

    unfold(): TagNode[] {
        return R.unfold((n: TagNode | null) => {
            if (!n) {
                return false;
            }
            if (n.tagChildren.length === 0) {
                return [n, null];
            }
            if (n.tagChildren.length === 1) {
                return [n, n.tagChildren[0]]
            }
            throw Error('Not the single child: ' + n.tagChildren);
        })(this.root);
    }
}

function getSiblingsSubtree(root: TagNode): SiblingsSubtree | null {
    if (!root.tagChildren.length) {
        return null;
    }

    const childrenSubtrees = R.pipe(
        R.map(getSiblingsSubtree),
        R.reject(R.isNil)
    )(root.tagChildren) as SiblingsSubtree[];

    if (childrenSubtrees.length) {
        return randomItem(childrenSubtrees).createWithParent(root);
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
    const path: TagNode[] = R.reject(n => n.name === 'body', deepest.unfold());

    if (path.length === 0) {
        return [];
    }

    if (path.length === 1) {
        return R.map(
            (s: Selector) => new Rule(s, style),
            genAllPossibleSelectors(path[0])
        );
    }

    return R.pipe(
        R.chain(
            ([ancestor, descendant]: [TagNode, TagNode]): [Selector, Selector][] =>
                R.xprod(genAllPossibleSelectors(ancestor), genAllPossibleSelectors(descendant))
        ),
        R.chain(
            ([ancestorSelector, descendantSelector]: [Selector, Selector]): Rule[] =>
                [
                    new Rule(new DescendantCombinator(ancestorSelector, descendantSelector), style, true),
                    new Rule(new ChildCombinator(ancestorSelector, descendantSelector), style, true)
                ]
        )
    )(twoElementVariationsInOrder(path));
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
        yield *R.map((selector: Selector): Rule => new Rule(selector, style, true))(innerSelectors);

        if (path.length) {
            yield *R.pipe(
                R.chain((innerSelector: Selector): [TagNode, Selector][] =>
                    R.xprod(path, [innerSelector])
                ),
                R.chain(([ancestor, innerSelector]: [TagNode, Selector]): [Selector, Selector][] =>
                    R.xprod(genAllPossibleSelectors(ancestor), [innerSelector])
                ),
                R.map(([ancestorSelector, innerSelector]): Rule =>
                    new Rule(new DescendantCombinator(ancestorSelector, innerSelector), style, true)
                )
            )(innerSelectors);
        }
    }

    if (path.length) {
        yield *R.map(
            (selector: Selector) => new Rule(new ChildCombinator(selector, new TypeSelector('*')), style, true)
        )(genAllPossibleSelectors(R.last(path)!));
    }

    yield *R.pipe(
        R.chain((node: TagNode): string[] => node.classList),
        R.uniq,
        R.map(clazz => new Rule(new ClassSelector(clazz), style, true))
    )(siblings);
}

function genAllPossibleSelectors(node: TagNode): Selector[] {
    if (node.classList.length) {
        return R.map(
            c => new ClassSelector(c),
            node.classList
        );
    }
    return [new TypeSelector(node.name)];
}

function genAllPossiblePseudoClassSelectors(name: string): Selector[] {
    const baseSelector = new TypeSelector(name);
    return [
        new PseudoClassSelector(baseSelector, 'first-child'),
        new PseudoClassSelector(baseSelector, 'last-child')
    ]
}

function allSameName(nodes: TagNode[]) {
    return R.all(n => n.name === nodes[0].name, nodes);
}
