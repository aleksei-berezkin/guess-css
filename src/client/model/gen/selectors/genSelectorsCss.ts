import { twoElementVariationsInOrder, xprod } from '../../../util';
import { TagNode } from '../../nodes';
import {
    ChildCombinator,
    ClassSelector, Declaration,
    DescendantCombinator,
    PseudoClassSelector,
    Rule,
    Selector,
    TypeSelector
} from '../../cssRules';
import { getSiblingsSubtree, SiblingsSubtree } from '../siblingsSubtree';
import { getDeepestSingleChildSubtree, SingleChildSubtree } from '../singleChildSubtree';
import { optional, Optional, stream } from '../../../stream/stream';

const constantRule = new Rule(
    new TypeSelector('div'),
    [
        ['display', 'inline-block'],
        ['padding', '.5em'],
        ['border', '1px solid black'],
    ]
);
const RULES_CHOICES = 3;

const colors = ['pink', 'lightgreen', 'lightblue', 'cyan', 'magenta', 'yellow', 'lightgrey'];

export function genRulesChoices(body: TagNode): Rule[][] | null {
    const [deepStyle, siblingsStyle] = stream(colors)
        .map((color): Declaration[] => [['background-color', color]])
        .takeRandom(2);

    const deepest: SingleChildSubtree = getDeepestSingleChildSubtree(body);
    const deepChildRules = genDeepChildRules(deepest, deepStyle);
    if (deepChildRules.length < RULES_CHOICES) {
        return null;
    }

    const siblingsSubtree = getSiblingsSubtree(body);
    if (!siblingsSubtree) {
        return null;
    }

    const siblingsRules = stream(genSiblingsRules(siblingsSubtree, siblingsStyle))
        .distinctBy(r => r.selectorsString)
        .toArray();
    if (siblingsRules.length < RULES_CHOICES) {
        return null;
    }

    return stream(deepChildRules).takeRandom(RULES_CHOICES)
        .zip(stream(siblingsRules).takeRandom(RULES_CHOICES))
        .map(([deepRule, siblingRule]) => [constantRule, deepRule, siblingRule])
        .toArray();
}

function genDeepChildRules(deepest: SingleChildSubtree, style: Declaration[]): Rule[] {
    const path: TagNode[] = deepest.unfold().filter(n => n.name !== 'body');

    if (!path.length) {
        return [];
    }

    if (path.length === 1) {
        return stream(path)
            .head()
            .flatMap(genAllPossibleSelectors)
            .map(s => new Rule(s, style))
            .toArray();
    }

    return twoElementVariationsInOrder(path)
        .flatMap(([ancestor, descendant]) =>
            xprod(genAllPossibleSelectors(ancestor), genAllPossibleSelectors(descendant))
        )
        .flatMap(([ancestorSelector, descendantSelector]) => [
            new Rule(new DescendantCombinator(ancestorSelector, descendantSelector), style, true),
            new Rule(new ChildCombinator(ancestorSelector, descendantSelector), style, true)
        ])
        .distinctBy(r => r.selectorsString)
        .toArray();
}

function *genSiblingsRules(siblingsSubtree: SiblingsSubtree, style: Declaration[]): IterableIterator<Rule> {
    const pathAndSiblings = siblingsSubtree.unfold();
    const path = pathAndSiblings.path.filter(n => n.name !== 'body');
    const siblings = pathAndSiblings.siblings;
    if (!path.length || !siblings.length) {
        return;
    }

    const sameName = allSameName(siblings).orElseUndefined();
    if (sameName) {
        const innerSelectors = genAllPossiblePseudoClassSelectors(sameName);

        yield *innerSelectors.map(s => new Rule(s, style, true));

        yield *stream(path)
            .flatMap(genAllPossibleSelectors)
            .flatMap(ancestorSelector =>
                innerSelectors.map(innerSelector =>
                    new Rule(new DescendantCombinator(ancestorSelector, innerSelector), style, true)
                )
            );
    }

    yield *genAllPossibleSelectors(stream(path).last().get())
        .map(selector => new Rule(new ChildCombinator(selector, new TypeSelector('*')), style, true));

    yield *stream(siblings)
        .flatMap(n => n.classes)
        .distinctBy(_ => _)
        .map(clazz => new Rule(new ClassSelector(clazz), style, true))
}

function genAllPossibleSelectors(node: TagNode): Selector[] {
    if (node.classes.length) {
        return node.classes
            .map(c => new ClassSelector(c));
    }

    return [new TypeSelector(node.name)];
}

function genAllPossiblePseudoClassSelectors(name: string): Selector[] {
    const baseSelector = new TypeSelector(name);
    return [
        new PseudoClassSelector(baseSelector, 'first-child'),
        new PseudoClassSelector(baseSelector, 'last-child')
    ];
}

function allSameName(nodes: TagNode[]): Optional<string> {
    const firstName = stream(nodes).head().get().name;
    return stream(nodes).all(n => n.name === firstName)
        ? optional([firstName])
        : optional([]);
}
