import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { ClassSelector, Rule, Selector } from '../cssRules';
import { getDeepestSingleChildSubtree } from './singleChildSubtree';
import { getNShuffled, range } from '../../util';

const positions = Vector.of('static', 'relative', 'absolute', 'fixed');

export function genCssPosition(body: TagNode): Vector<Vector<Rule>> | null {
    // TODO take 2 (3) random items
    const path: Vector<TagNode> = getDeepestSingleChildSubtree(body).unfold().tail().getOrThrow().take(3);
    const pathAndPositions = path.zip(getNShuffled(positions, path.length()));
    return range(0, 3)
        .map(i => pathAndPositions
            .map(([item, positions]) =>
                new Rule(
                    getClassSelector(item),
                    Vector.of(
                        ['position', positions.get(i).getOrThrow(), true],
                        // TODO random position
                        ['top', '20px'],
                    )
                )
        ));
}

function getClassSelector(node: TagNode): Selector {
    return new ClassSelector(node.classes.single().getOrThrow());
}
