import { TagNode } from '../../nodes';
import { ChildCombinator, ClassSelector, Rule, Selector, TypeSelector } from '../../cssRules';
import { getDeepestSingleChildSubtree } from '../singleChildSubtree';
import { CssRules } from '../../puzzler';
import { contrastColorVar, getColorVar } from '../vars';
import { fontRule } from '../commonRules';
import { transpose } from '../transpose';
import { takeRandom } from '../../../util/takeRandom';
import { single } from '../../../util/single';

export function genPositionCss(body: TagNode): CssRules {
    const [outer, inner] = get2Last(getDeepestSingleChildSubtree(body).unfoldToItr());
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

function get2Last<T>(gen: IterableIterator<T>): T[] {
    const last = [];
    for (const it of gen) {
        if (last.push(it) === 3) {
            last.shift();
        }
    }
    return last;
}

function getClassSelector(node: TagNode): Selector {
    return new ClassSelector(single(node.classes));
}


type Position = 'static' | 'relative' | 'absolute' | 'fixed';

const outerPositions: Position[] = ['static', 'relative', 'absolute'];
const innerPositions: Position[] = ['static', 'relative', 'absolute', 'fixed'];

function innerOuterPositionsShuffled(): Position[][] {
    const outerShuffled = takeRandom(outerPositions, 3);
    const innerShuffled = takeRandom(innerPositions, 3);
    if (innerShuffled.every((pos, ix) => pos === outerShuffled[ix])
        || innerShuffled.some((pos, ix) => pos === 'static' && outerShuffled[ix] === 'static')
    ) {
        return innerOuterPositionsShuffled();
    }

    return [outerShuffled, innerShuffled];
}
