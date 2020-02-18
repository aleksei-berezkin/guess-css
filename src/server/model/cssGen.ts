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

    const deepest: NodeAndDepth = getDeepestSingleChildSubtree(body);
    const deepChildRules = [...genDeepChildRules(R.tail(unfoldSingleChildren(deepest.root)), styles[0])];
    if (deepChildRules.length < RULES_CHOICES) {
        return null;
    }

    const siblingsSubtree = getSiblingsSubtree(body);
    if (!siblingsSubtree) {
        return null;
    }

    const unfolded = unfoldToSiblings(siblingsSubtree);
    const siblingsRules = [...genSiblingsRules(R.tail(unfolded.path), unfolded.siblings, styles[1])];
    if (siblingsRules.length < RULES_CHOICES) {
        return null;
    }

    const shuffledDeepRules = shuffled(deepChildRules);
    const shuffledSiblingRules = shuffled(siblingsRules);

    return R.pipe(
        R.map((i: number) => [constantRule, shuffledDeepRules[i], shuffledSiblingRules[i]])
    )(R.range(0, RULES_CHOICES));
}

interface NodeAndDepth {
    root: TagNode,
    depth: number,
}

function getDeepestSingleChildSubtree(root: TagNode): NodeAndDepth {
    if (!root.tagChildren.length) {
        return {root, depth: 1};
    }

    const oneOfDeepestChildren = randomItem(
        R.pipe(
            R.map(getDeepestSingleChildSubtree),
            R.sortBy(nd => nd.depth),
            R.groupWith((l, r) => l.depth === r.depth),
            R.reduce((_: NodeAndDepth[], deeper: NodeAndDepth[]) => deeper, [])
        )(
            root.tagChildren
        )
    );

    return {
        root: root.copyWithChild(oneOfDeepestChildren.root),
        depth: oneOfDeepestChildren.depth + 1
    };
}

function getSiblingsSubtree(root: TagNode): TagNode | null {
    if (!root.tagChildren.length) {
        return null;
    }

    const childrenSubtrees = R.pipe(
        R.map(getSiblingsSubtree),
        R.reject(R.isNil)
    )(root.tagChildren) as TagNode[];

    if (childrenSubtrees.length) {
        return root.copyWithChild(randomItem(childrenSubtrees))
    }

    if (root.tagChildren.length > 1) {
        return root;
    }

    return null;
}

function unfoldSingleChildren(root: TagNode): TagNode[] {
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
    })(root);
}

function unfoldToSiblings(root: TagNode): {path: TagNode[], siblings: TagNode[]} {
    const path = R.unfold((n: TagNode | null) => {
        if (!n) {
            return false;
        }
        if (n.tagChildren.length > 1) {
            return [n, null];
        }
        return [n, n.tagChildren[0]];
    })(root);
    return {path, siblings: R.last(path)!.tagChildren};
}

function genDeepChildRules(childrenUnfold: TagNode[], style: {[k: string]: string}): Rule[] {
    if (childrenUnfold.length === 1) {
        return R.map(
            (s: Selector) => new Rule(s, style),
            genAllPossibleSelectors(childrenUnfold[0])
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
    )(twoElementVariationsInOrder(childrenUnfold));
}

function *genSiblingsRules(path: TagNode[], siblings: TagNode[], style: {[k: string]: string}): IterableIterator<Rule> {
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
