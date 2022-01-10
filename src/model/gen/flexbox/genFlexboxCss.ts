import { TagNode } from '../../nodes';
import { Declaration, Rule, TypeSelector } from '../../cssRules';
import { getSiblingsSubtree } from '../siblingsSubtree';
import { stream, streamOf } from 'fluent-streams';
import { CssRules } from '../../puzzler';
import { contrastColorVar } from '../vars';
import { body100percentNoMarginRule, fontRule } from '../commonRules';
import { transpose } from '../transpose';

export function genFlexboxCss(body: TagNode, canWrap: boolean): CssRules {
    const direction = streamOf('row', 'column', 'row-reverse', 'column-reverse').randomItem().get();
    const wrap = canWrap && getSiblingsSubtree(body)!.unfold().siblings.length > 2 && Math.random() < .7;
    const alignName = wrap && Math.random() < .5 ? 'align-content' : 'align-items';

    return {
        choices: transpose([getJustifyContents(), getAlignItems()])
            .map(([justifyContent, alignItems]) =>
                [
                    new Rule(
                        new TypeSelector('body'),
                        stream<Declaration>([{property: 'display', value: 'flex'}])
                            .appendAll(
                                direction !== 'row'
                                    ? [{property: 'flex-direction', value: direction}]
                                    : []
                            )
                            .appendAll(
                                wrap ? [{property: 'flex-wrap', value: 'wrap'}] : []
                            )
                            .appendAll([
                                {property: 'justify-content', value: justifyContent, differing: true},
                                {property: alignName, value: alignItems, differing: true},
                            ])
                            .toArray(),
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
    return streamOf('flex-start', 'flex-end', 'center', 'space-between', 'space-around')
        .takeRandom(3).toArray();
}

function getAlignItems() {
    return streamOf('flex-start', 'flex-end', 'center', 'stretch')
        .takeRandom(3).toArray();
}
