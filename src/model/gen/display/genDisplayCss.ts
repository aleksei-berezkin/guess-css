import { TagNode } from '../../nodes';
import { ChildCombinator, ClassSelector, Declaration, Rule, Selector, TypeSelector } from '../../cssRules';
import { getSiblingsSubtree } from '../siblingsSubtree';
import { stream } from 'fluent-streams';
import { CssRules } from '../../puzzler';
import { contrastColorVar, getColorVar } from '../vars';
import { fontRule } from '../commonRules';
import { getNShuffled, randomBounded, randomItemsInOrder } from '../randomItems';

const displays = ['inline', 'block', 'inline-block'];

export function genDisplayCss(body: TagNode): CssRules {
    const {path, siblings} = getSiblingsSubtree(body)!.unfold();
    const [displays1, displays2, displays3] = getNShuffled(displays, 3);
    const bgColorVar = getColorVar('background', 0);

    const parentSelector = stream(path).last().map(getClassSelector).get()
    const parentRules = displays1
        .map(d => new Rule(parentSelector, [
            {property: 'display', value: d, differing: true},
            {property: 'background-color', value: bgColorVar.id},
        ]));

    const [children1, children2] = splitChildren(siblings);

    const [width1, width2] = stream([`${ 5 * randomBounded(6, 17) }%`, undefined]).shuffle().toArray();

    const children1Rules = displays2.map(childrenToRule(children1, width1));
    const children2Rules = displays3.map(childrenToRule(children2, width2));

    const borderColorVar = getColorVar('border', 0);
    return {
        choices: stream(parentRules).zip(children1Rules).zip(children2Rules)
            .map(([[ruleParent, rule1], rule2]) => [ruleParent, rule1, rule2])
            .toArray(),
        common: [
            new Rule(
                new ChildCombinator(parentSelector, new TypeSelector('div')),
                [
                    {property: 'border', value: `4px solid ${ borderColorVar.id }`},
                    {property: 'padding', value: '.25em'},
                ]
            ),
            fontRule,
        ],
        vars: {
            contrastColor: contrastColorVar,
            colors: [bgColorVar, borderColorVar]
        },
    };
}

function splitChildren(children: TagNode[]): [TagNode[], TagNode[]] {
    if (children.length < 2) {
        throw Error('Length=' + children.length);
    }

    const someChildren = randomItemsInOrder(children, randomBounded(1, children.length));
    const otherChildren = children.filter(n => !someChildren.find(m => n === m));

    // It's more convenient when order of rules is similar to the order of children, at least for first
    if (someChildren[0].classes < otherChildren[0].classes) {
        return [someChildren, otherChildren];
    }
    return [otherChildren, someChildren];
}

function childrenToRule(children: TagNode[], width: string | undefined): (display: string) => Rule {
    return display => new Rule(
        children.map(getClassSelector),
        stream<Declaration>([{property: 'display', value: display, differing: true}])
            .appendAll(
                !!width ? [{property: 'width', value: width!}] : []
            )
            .toArray()
    );
}

function getClassSelector(node: TagNode): Selector {
    return new ClassSelector(stream(node.classes).single().get());
}
