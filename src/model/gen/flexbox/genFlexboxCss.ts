import { TagNode } from '../../nodes';
import { Declaration, Rule, TypeSelector } from '../../cssRules';
import { randomItem, transpose } from '../../../util';
import { getSiblingsSubtree } from '../siblingsSubtree';
import { stream, streamOf } from 'fluent-streams';
import { RulesParam } from '../../puzzler';
import { contrastColorVar } from '../vars';
import { globalRule } from '../globalRule';

export function genFlexboxCss(body: TagNode): RulesParam {
    const direction = randomItem(['row', 'column', 'row-reverse', 'column-reverse']);
    const wrap = getSiblingsSubtree(body)!.unfold().siblings.length > 2 && Math.random() < .7;
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
            new Rule(
                [new TypeSelector('html'), new TypeSelector('body')],
                [
                    {property: 'height', value: '100%'},
                    {property: 'margin', value: '0'},
                ],
            ),
            new Rule(
                new TypeSelector('div'),
                [
                    {property: 'border', value: `1px solid ${ contrastColorVar }`},
                    {property: 'padding', value: '.5em'},
                ]
            ),
            globalRule,
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
