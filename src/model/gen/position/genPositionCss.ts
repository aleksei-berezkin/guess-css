import { TagNode } from '../../nodes';
import { ChildCombinator, ClassSelector, Rule, Selector, TypeSelector } from '../../cssRules';
import { getDeepestSingleChildSubtree } from '../singleChildSubtree';
import { stream } from 'fluent-streams';
import { CssRules } from '../../puzzler';
import { contrastColorVar, getColorVar } from '../vars';
import { fontRule } from '../commonRules';
import { transpose } from '../transpose';

export function genPositionCss(body: TagNode): CssRules {
    const [outer, inner] = getDeepestSingleChildSubtree(body).unfoldToStream().takeLast(2);
    const outerBorderColor = getColorVar('border', 0);
    const innerBgColor = getColorVar('background', 0);

    return {
        choices: transpose(innerOuterPositionsShuffled()).map(([outerPosition, innerPosition]) =>
            [
                [outer, outerPosition, {property: 'border', value: `2px solid ${ outerBorderColor.id }`} as const] as const,
                [inner, innerPosition, {property: 'background-color', value: innerBgColor.id} as const] as const,
            ]
                .map(([node, position, declaration]) =>
                    new Rule(
                        getClassSelector(node),
                        [
                            {property: 'position', value: position, differing: true},
                            declaration,
                            {property: 'left', value: '3em'},
                        ]
                    )
                )
        ),
        common: [
            new Rule(
                new ChildCombinator(getClassSelector(outer), new TypeSelector('*')),
                [{property: 'padding', value: '.5em'}]
            ),
            fontRule,
        ],
        vars: {
            contrastColor: contrastColorVar,
            colors: [outerBorderColor, innerBgColor],
        },
    };
}

function getClassSelector(node: TagNode): Selector {
    return new ClassSelector(stream(node.classes).single().get());
}


type Position = 'static' | 'relative' | 'absolute' | 'fixed';

const outerPositions: Position[] = ['static', 'relative', 'absolute'];
const innerPositions: Position[] = ['static', 'relative', 'absolute', 'fixed'];

function innerOuterPositionsShuffled(): Position[][] {
    const outerShuffled = stream(outerPositions).takeRandom(3).toArray();
    const innerShuffled = stream(innerPositions).takeRandom(3).toArray();
    const zipped = stream(outerShuffled).zip(innerShuffled);
    if (zipped.all(([o, i]) => o === i) || zipped.any(([o, i]) => o === 'static' && i === 'static')) {
        return innerOuterPositionsShuffled();
    }
    return [outerShuffled, innerShuffled];
}
