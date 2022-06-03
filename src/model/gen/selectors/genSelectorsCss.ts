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
import { CssRules } from '../../puzzler';
import { contrastColorVar, getColorVar } from '../vars';
import { fontRule } from '../commonRules';
import { twoElementVariationsInOrder, xprod } from '../combineItems';
import { takeRandom } from '../../../util/takeRandom';
import { distinctBy } from '../../../util/distinctBy';
import { distinct } from '../../../util/distinct';

const constantRule = new Rule(
    new TypeSelector('div'),
    [
        {property: 'display', value: 'inline-block'},
        {property: 'padding', value: '.5em'},
        {property: 'border', value: `1px solid ${ contrastColorVar }`},
    ]
);
// TODO shared in the whole project
const RULES_CHOICES = 3;

export function genRulesChoices(body: TagNode): CssRules | null {
    const colorVars = Array.from({length: 2}).map((_, i) => getColorVar('background', i));
    const [deepStyle, siblingsStyle] = takeRandom(
        colorVars
            .map((colorVar): Declaration[] => [{property: 'background-color', value: colorVar.id}]),
        2,
    );

    const deepest: SingleChildSubtree = getDeepestSingleChildSubtree(body);
    const deepChildRules = takeRandom(
        genDeepChildRules(deepest, deepStyle),
        RULES_CHOICES,
    );
    if (deepChildRules.length < RULES_CHOICES) {
        return null;
    }

    const siblingsSubtree = getSiblingsSubtree(body);
    if (!siblingsSubtree) {
        return null;
    }

    const siblingsRules = takeRandom(
        distinctBy(
            [...genSiblingsRules(siblingsSubtree, siblingsStyle)],
            r => r.selectorsString,
        ),
        RULES_CHOICES,
    );
    if (siblingsRules.length < RULES_CHOICES) {
        return null;
    }

    return {
        choices: deepChildRules
            .map((deepRule, i) => [deepRule, siblingsRules[i]]),
        common: [
            constantRule,
            fontRule,
        ],
        vars: {
            contrastColor: contrastColorVar,
            colors: colorVars,
        }
    };
}

function genDeepChildRules(deepest: SingleChildSubtree, style: Declaration[]): Rule[] {
    const path: TagNode[] = deepest.unfold().filter(n => n.name !== 'body');

    if (!path.length) {
        return [];
    }

    if (path.length === 1) {
        return genAllPossibleSelectors(path[0])
            .map(s => new Rule(s, style));
    }

    const variations = twoElementVariationsInOrder(path)
        .flatMap(([ancestor, descendant]) =>
            xprod(genAllPossibleSelectors(ancestor), genAllPossibleSelectors(descendant))
        )
        .flatMap(([ancestorSelector, descendantSelector]) => [
            new Rule(new DescendantCombinator(ancestorSelector, descendantSelector), style, true),
            new Rule(new ChildCombinator(ancestorSelector, descendantSelector), style, true)
        ]);

    return distinctBy(variations, v => v.selectorsString);
}

function* genSiblingsRules(siblingsSubtree: SiblingsSubtree, style: Declaration[]): IterableIterator<Rule> {
    const pathAndSiblings = siblingsSubtree.unfold();
    const path = pathAndSiblings.path.filter(n => n.name !== 'body');
    const siblings = pathAndSiblings.siblings;
    if (!path.length || !siblings.length) {
        return;
    }

    const sameName = allSameNameOrUndefined(siblings);
    if (sameName) {
        const innerSelectors = genAllPossiblePseudoClassSelectors(sameName);

        yield* innerSelectors.map(s => new Rule(s, style, true));

        yield* path
            .flatMap(genAllPossibleSelectors)
            .flatMap(ancestorSelector =>
                innerSelectors.map(innerSelector =>
                    new Rule(new DescendantCombinator(ancestorSelector, innerSelector), style, true)
                )
            );
    }

    yield* genAllPossibleSelectors(path[path.length - 1])
        .map(selector => new Rule(new ChildCombinator(selector, new TypeSelector('*')), style, true));

    yield* distinct(siblings.flatMap(tn => tn.classes))
        .map(clazz => new Rule(new ClassSelector(clazz), style, true));
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

function allSameNameOrUndefined(nodes: TagNode[]): string | undefined {
    const firstName = nodes[0].name;
    return nodes.every(n => n.name === firstName)
        ? firstName
        : undefined;
}
