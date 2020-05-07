import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { Declaration, Rule, TypeSelector } from '../cssRules';
import { randomItem, transpose } from '../../util';
import { getSiblingsSubtree } from './siblingsSubtree';

export function genCssFlexbox(body: TagNode): Vector<Vector<Rule>> | null {
    const direction = randomItem(Vector.of('row', 'column', 'row-reverse', 'column-reverse'));
    const wrap = getSiblingsSubtree(body)!.unfold().siblings.length() > 2 && Math.random() < .7;
    // TODO puzzle this?
    const alignName = wrap && Math.random() < .8 ? 'align-content' : 'align-items';

    return transpose(Vector.of(getJustifyContents(), getAlignItems()))
        .map(([justifyContent, alignItems]) =>
            Vector.of(
                new Rule(
                    Vector.of(new TypeSelector('html'), new TypeSelector('body')),
                    Vector.of(
                        ['height', '100%'],
                        ['margin', '0'],
                    ),
                ),
                new Rule(
                    new TypeSelector('body'),
                    Vector.of<Declaration>(['display', 'flex'])
                        .transform(
                            d => direction !== 'row'
                                ? d.append(['flex-direction', direction])
                                : d
                        )
                        .transform(
                            d => wrap
                                ? d.append(['flex-wrap', 'wrap'])
                                : d
                        )
                        .appendAll([
                            ['justify-content', justifyContent, true],
                            [alignName, alignItems, true],
                        ]),
                ),
                new Rule(
                    new TypeSelector('div'),
                    Vector.of(
                        ['border', '1px solid black'],
                        wrap
                            ? ['flex-basis', '40%']
                            : ['padding', '.5em'],
                    )
                ),
            )
        );
}

function getJustifyContents() {
    return Vector.of('flex-start', 'flex-end', 'center', 'space-between', 'space-around')
        .shuffle().take(3);
}

function getAlignItems() {
    return Vector.of('flex-start', 'flex-end', 'center', 'stretch')
        .shuffle().take(3);
}
