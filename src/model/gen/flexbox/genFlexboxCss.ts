import { TagNode } from '../../nodes';
import { Rule, TypeSelector } from '../../cssRules';
import { getSiblingsSubtree } from '../siblingsSubtree';
import { CssRules } from '../../puzzler';
import { contrastColorVar } from '../vars';
import { body100percentNoMarginRule, fontRule } from '../commonRules';
import { transpose } from '../transpose';
import { takeRandom } from '../../../util/takeRandom';
import { randomItem } from '../../../util/randomItem';

export function genFlexboxCss(body: TagNode, canWrap: boolean): CssRules {
    const direction = randomItem(['row', 'column', 'row-reverse', 'column-reverse']);
    const wrap = canWrap && getSiblingsSubtree(body)!.unfold().siblings.length > 2 && Math.random() < .7;
    const alignName = wrap && Math.random() < .5 ? 'align-content' : 'align-items';

    return {
        choices: transpose([getJustifyContents(), getAlignItems()])
            .map(([justifyContent, alignItems]) =>
                [
                    new Rule(
                        new TypeSelector('body'),
                        [
                            {property: 'display', value: 'flex'},
                            ...direction !== 'row'
                                ? [{property: 'flex-direction', value: direction}]
                                : [],
                            ...wrap ? [{property: 'flex-wrap', value: 'wrap'}] : [],
                            {property: 'justify-content', value: justifyContent, differing: true},
                            {property: alignName, value: alignItems, differing: true},
                        ],
                    ),
                    ...(
                        wrap
                            ? [new Rule(new TypeSelector('div'), [{property: 'flex-basis', value: '30%'}])]
                            : []
                    ),
                ]
            ),
        common: [
            body100percentNoMarginRule,
            new Rule(
                new TypeSelector('div'),
                [
                    {property: 'border', value: `1px solid ${ contrastColorVar }`},
                    {property: 'padding', value: '.5em'},
                ]
            ),
            fontRule,
        ],
        vars: {
            contrastColor: contrastColorVar,
            colors: [],
        },
    };
}

function getJustifyContents() {
    return takeRandom(['flex-start', 'flex-end', 'center', 'space-between', 'space-around'], 3);
}

function getAlignItems() {
    return takeRandom(['flex-start', 'flex-end', 'center', 'stretch'], 3);
}
