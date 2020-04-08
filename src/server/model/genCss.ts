import { nRandom, randomVectorItem, range, twoElementVariationsInOrder, xprod } from '../../shared/util';
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

const colors = Vector.of('pink', 'lightgreen', 'lightblue', 'cyan', 'magenta', 'yellow', 'lightgrey');

export function genCssRulesChoices(body: TagNode): Rule[][] | null {
    const [deepStyle, siblingsStyle] = colors
        .shuffle()
        .take(2)
        .map(color => ({'background-color': color}));

    const deepest: SingleChildSubtree = getDeepestSingleChildSubtree(body);
    const deepChildRules = genDeepChildRules(deepest, deepStyle);
    if (deepChildRules.length() < RULES_CHOICES) {
        return null;
    }

    const siblingsSubtree = getSiblingsSubtree(body);
    if (!siblingsSubtree) {
        return null;
    }

    const siblingsRules = Vector.ofIterable(genSiblingsRules(siblingsSubtree, siblingsStyle));
    if (siblingsRules.length() < RULES_CHOICES) {
        return null;
    }

    const shuffledDeepRules = nRandom<Rule>(RULES_CHOICES)(deepChildRules.toArray());
    const shuffledSiblingRules = nRandom<Rule>(RULES_CHOICES)(siblingsRules.toArray());

    return range(0, RULES_CHOICES)
        .map((i: number) => [constantRule, shuffledDeepRules[i], shuffledSiblingRules[i]])
        .toArray();
}

function getDeepestSingleChildSubtree(root: TagNode): SingleChildSubtree {
    if (root.tagChildrenVector.isEmpty()) {
        return new SingleChildSubtree(root);
    }

    const deepestChildren: Vector<SingleChildSubtree> = root.tagChildrenVector
        .map(getDeepestSingleChildSubtree)
        .groupBy(subtree => subtree.depth)
        .reduce(([d1, s1], [d2, s2]) => d1 > d2 ? [d1, s1] : [d2, s2])
        .map(([_, s]) => s)
        .getOrThrow();

    return randomVectorItem(deepestChildren).createWithParent(root);
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
        return randomVectorItem(childrenSubtrees).createWithParent(root);
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

    unfold(): {path: Vector<TagNode>, siblings: Vector<TagNode>} {
        const path = Vector.unfoldRight<TagNode | undefined, TagNode>(
            this.root,
            n => Option.of(n).map(n => [n, n.tagChildrenVector.single().getOrUndefined()])
        );

        if (path.isEmpty()) {
            return {path: Vector.empty(), siblings: Vector.empty()};
        }

        return {path, siblings: path.last().getOrThrow().tagChildrenVector};
    }
}

function genDeepChildRules(deepest: SingleChildSubtree, style: {[p: string]: string}): Vector<Rule> {
    const path: Vector<TagNode> = deepest.unfold().filter(n => n.name !== 'body');

    if (path.length() === 0) {
        return Vector.empty();
    }

    if (path.length() === 1) {
        return path.take(1)
            .flatMap(genAllPossibleSelectors)
            .map(s => new Rule(s, style));
    }

    return twoElementVariationsInOrder(path)
        .flatMap(([ancestor, descendant]) =>
            xprod(genAllPossibleSelectors(ancestor), genAllPossibleSelectors(descendant))
        )
        .flatMap(([ancestorSelector, descendantSelector]) => Vector.of(
            new Rule(new DescendantCombinator(ancestorSelector, descendantSelector), style, true),
            new Rule(new ChildCombinator(ancestorSelector, descendantSelector), style, true)
        ));
}

function *genSiblingsRules(siblingsSubtree: SiblingsSubtree, style: {[k: string]: string}): IterableIterator<Rule> {
    const pathAndSiblings = siblingsSubtree.unfold();
    const path = pathAndSiblings.path.filter(n => n.name !== 'body');
    const siblings = pathAndSiblings.siblings;
    if (path.isEmpty() || siblings.isEmpty()) {
        return;
    }

    const sameName = allSameName(siblings).getOrUndefined();
    if (sameName) {
        const innerSelectors = genAllPossiblePseudoClassSelectors(sameName);

        yield *innerSelectors.map(s => new Rule(s, style, true));

        yield *path
            .flatMap(genAllPossibleSelectors)
            .flatMap(ancestorSelector =>
                innerSelectors.map(innerSelector =>
                    new Rule(new DescendantCombinator(ancestorSelector, innerSelector), style, true)
                )
            );
    }

    yield *genAllPossibleSelectors(path.last().getOrThrow())
        .map(selector => new Rule(new ChildCombinator(selector, new TypeSelector('*')), style, true));

    yield *siblings
        .flatMap(n => n.classes)
        .distinctBy(_ => _)
        .map(clazz => new Rule(new ClassSelector(clazz), style, true))
}

function genAllPossibleSelectors(node: TagNode): Vector<Selector> {
    if (!node.classes.isEmpty()) {
        return node.classes
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

function allSameName(nodes: Vector<TagNode>): Option<string> {
    const firstName = nodes.head().getOrThrow().name;
    return nodes.allMatch(n => n.name === firstName)
        ? Option.of(firstName)
        : Option.none();
}
