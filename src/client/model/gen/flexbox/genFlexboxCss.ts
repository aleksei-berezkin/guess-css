import { TagNode } from '../../nodes';
import { Declaration, Rule, TypeSelector } from '../../cssRules';
import { randomItem, transposeArray } from '../../../util';
import { getSiblingsSubtree } from '../siblingsSubtree';
import { stream, streamOf } from '../../../stream/stream';

export function genFlexboxCss(body: TagNode): Rule[][] {
    const direction = randomItem(['row', 'column', 'row-reverse', 'column-reverse']);
    const wrap = getSiblingsSubtree(body)!.unfold().siblings.length > 2 && Math.random() < .7;
    const alignName = wrap && Math.random() < .5 ? 'align-content' : 'align-items';

    return transposeArray([getJustifyContents(), getAlignItems()])
        .map(([justifyContent, alignItems]) =>
            [
                new Rule(
                    [new TypeSelector('html'), new TypeSelector('body')],
                    [
                        ['height', '100%'],
                        ['margin', '0'],
                    ],
                ),
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
                new Rule(
                    new TypeSelector('div'),
                    [
                        ['border', '1px solid black'],
                        wrap
                            ? ['flex-basis', '40%']
                            : ['padding', '.5em'],
                    ]
                ),
            ]
        );
}

function getJustifyContents() {
    return streamOf('flex-start', 'flex-end', 'center', 'space-between', 'space-around')
        .shuffle().take(3).toArray();
}

function getAlignItems() {
    return streamOf('flex-start', 'flex-end', 'center', 'stretch')
        .shuffle().take(3).toArray();
}
