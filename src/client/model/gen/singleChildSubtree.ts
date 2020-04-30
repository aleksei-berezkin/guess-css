import { TagNode } from '../nodes';
import { Option, Vector } from 'prelude-ts';
import { randomItem } from '../../util';

export class SingleChildSubtree {
    constructor(readonly root: TagNode, readonly depth: number = 1) {
        if (depth < 1) {
            throw new Error('Bad ' + depth);
        }
        if (root.children.length() > 1) {
            throw new Error('Not single child: ' + root.children);
        }
    }

    createWithParent(parent: TagNode): SingleChildSubtree {
        return new SingleChildSubtree(parent.copyWithSingleChild(this.root), this.depth + 1);
    }

    unfold(): Vector<TagNode> {
        return Vector.unfoldRight<TagNode | undefined, TagNode>(
            this.root,
            n => Option.of(n).map(n => [n, n.tagChildren.single().getOrUndefined()])
        );
    }
}

export function getDeepestSingleChildSubtree(root: TagNode): SingleChildSubtree {
    if (root.tagChildren.isEmpty()) {
        return new SingleChildSubtree(root);
    }

    const deepestChildren: Vector<SingleChildSubtree> = root.tagChildren
        .map(getDeepestSingleChildSubtree)
        .groupBy(subtree => subtree.depth)
        .reduce(([d1, s1], [d2, s2]) => d1 > d2 ? [d1, s1] : [d2, s2])
        .map(([_, s]) => s)
        .getOrThrow();

    return randomItem(deepestChildren).createWithParent(root);
}
