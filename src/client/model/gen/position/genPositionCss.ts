import { TagNode } from '../../nodes';
import { Vector } from 'prelude-ts';
import { ChildCombinator, ClassSelector, Rule, Selector, TypeSelector } from '../../cssRules';
import { getDeepestSingleChildSubtree } from '../singleChildSubtree';
import { transpose } from '../../../util';

const colors = Vector.of('#f8a8', '#0a08', '#89f8', '#ccc8');

export function genPositionCss(body: TagNode): Vector<Vector<Rule>> {
    const [outer, inner] = getDeepestSingleChildSubtree(body).unfold().tail().getOrThrow();
    const [outerColor, innerColor] = colors.shuffle();

    return transpose(innerOuterPositionsShuffled()).map(([outerPosition, innerPosition]) =>
        Vector.of<Rule>(
            new Rule(
                new ChildCombinator(getClassSelector(outer), new TypeSelector('*')),
                Vector.of(
                    ['padding', '.5em'],
                )
            )
        ).appendAll(
            Vector.of<[TagNode, string, string]>(
                [outer, outerPosition, outerColor],
                [inner, innerPosition, innerColor]
            )
                .map(([node, position, color]) => 
                    new Rule(
                        getClassSelector(node),
                        Vector.of(
                            ['position', position, true],
                            ['background-color', color],
                            ['left', '3em'],
                        )
                    )
                )
        )
    );
}

function getClassSelector(node: TagNode): Selector {
    return new ClassSelector(node.classes.single().getOrThrow());
}


type Position = 'static' | 'relative' | 'absolute' | 'fixed';

const outerPositions = Vector.of<Position>('static', 'relative', 'absolute');
const innerPositions = Vector.of<Position>('static', 'relative', 'absolute', 'fixed');

function innerOuterPositionsShuffled(): Vector<Vector<Position>> {
    const outerShuffled = outerPositions.shuffle().take(3);
    const innerShuffled = innerPositions.shuffle().take(3);
    if (outerShuffled.equals(innerShuffled)
        || outerShuffled.zip(innerShuffled)
            .find(([outer, inner]) => outer === 'static' && inner === 'static').isSome()) {
        return innerOuterPositionsShuffled();
    }
    return Vector.of(outerShuffled, innerShuffled);
}
