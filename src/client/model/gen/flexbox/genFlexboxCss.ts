import { TagNode } from '../../nodes';
import { Declaration, Rule, TypeSelector } from '../../cssRules';
import { randomItem, transpose } from '../../../util';
import { getSiblingsSubtree } from '../siblingsSubtree';
import { stream, streamOf } from '../../../stream/stream';
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
                        stream<Declaration>([['display', 'flex']])
                            .appendIf(
                                direction !== 'row',
                                ['flex-direction', direction]
                            )
                            .appendIf(
                                wrap, ['flex-wrap', 'wrap']
                            )
                            .appendAll([
                                ['justify-content', justifyContent, true],
                                [alignName, alignItems, true],
                            ])
                            .toArray(),
                    ),
                    ...(
                        wrap
                            ? [new Rule(new TypeSelector('div'), [['flex-basis', '30%']])]
                            : []
                    ),
                ]
            ),
        common: [
            new Rule(
                [new TypeSelector('html'), new TypeSelector('body')],
                [
                    ['height', '100%'],
                    ['margin', '0'],
                ],
            ),
            new Rule(
                new TypeSelector('div'),
                [
                    ['border', `1px solid ${ contrastColorVar }`],
                    ['padding', '.5em'],
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
