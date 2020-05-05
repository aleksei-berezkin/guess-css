import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { ChildCombinator, ClassSelector, Rule, Selector, TypeSelector } from '../cssRules';
import { getDeepestSingleChildSubtree } from './singleChildSubtree';
import { transpose } from '../../util';

const outerPositions = Vector.of('static', 'relative', 'absolute');
const innerPositions = Vector.of('static', 'relative', 'absolute', 'fixed');

const colors = Vector.of('#f8ab', '#0a0b', '#89fb', '#cccb');

export function genCssPosition(body: TagNode): Vector<Vector<Rule>> | null {
    // TODO disallowed static>static, better random
    // TODO unfold rejects body tag
    const [outer, inner] = getDeepestSingleChildSubtree(body).unfold().tail().getOrThrow();
    const [outerColor, innerColor] = colors.shuffle();
    const choicesPositions = transpose(
        Vector.of(
            outerPositions.shuffle().take(3),
            innerPositions.shuffle().take(3),
        )
    );

    return choicesPositions.map(([outerPosition, innerPosition]) =>
        Vector.of(
            new Rule(
                new ChildCombinator(new TypeSelector('div'), new TypeSelector('div')),
                Vector.of(
                    ['padding', '6px'],
                    ['border', '1px solid black'],
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
                            // TODO random position
                            ['left', '30px'],
                        )
                    )
                )
        )
    );
}

function getClassSelector(node: TagNode): Selector {
    return new ClassSelector(node.classes.single().getOrThrow());
}
