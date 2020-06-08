import { TagNode } from '../../nodes';
import { ChildCombinator, ClassSelector, Rule, Selector, TypeSelector } from '../../cssRules';
import { getDeepestSingleChildSubtree } from '../singleChildSubtree';
import { transposeArray } from '../../../util';
import { stream } from '../../../stream/stream';

const colors = ['#f8a8', '#0a08', '#89f8', '#ccc8'];

export function genPositionCss(body: TagNode): Rule[][] {
    const [outer, inner] = getDeepestSingleChildSubtree(body).unfoldToStream().tail().takeLast(2);
    const [outerColor, innerColor] = stream(colors).shuffle().toArray();

    return transposeArray(innerOuterPositionsShuffled()).map(([outerPosition, innerPosition]) =>
        [
            new Rule(
                new ChildCombinator(getClassSelector(outer), new TypeSelector('*')),
                [
                    ['padding', '.5em'],
                ]
            ),
            ...[
                [outer, outerPosition, outerColor] as const,
                [inner, innerPosition, innerColor] as const,
            ]
                .map(([node, position, color]) =>
                    new Rule(
                        getClassSelector(node),
                        [
                            ['position', position, true],
                            ['background-color', color],
                            ['left', '3em'],
                        ]
                    )
                )
            
        ]
    );
}

function getClassSelector(node: TagNode): Selector {
    return new ClassSelector(stream(node.classes).single().get());
}


type Position = 'static' | 'relative' | 'absolute' | 'fixed';

const outerPositions: Position[] = ['static', 'relative', 'absolute'];
const innerPositions: Position[] = ['static', 'relative', 'absolute', 'fixed'];

function innerOuterPositionsShuffled(): Position[][] {
    const outerShuffled = stream(outerPositions).shuffle().take(3);
    const innerShuffled = stream(innerPositions).shuffle().take(3);
    const zipped = outerShuffled.zip(innerShuffled);
    if (zipped.all(([o, i]) => o === i) || zipped.any(([o, i]) => o === 'static' && i === 'static')) {
        return innerOuterPositionsShuffled();
    }
    return [outerShuffled.toArray(), innerShuffled.toArray()];
}
