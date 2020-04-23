import { TagNode } from '../nodes';
import { Option, Vector } from 'prelude-ts';
import { randomItem } from '../../util';

export class SiblingsSubtree {
    constructor(readonly root: TagNode, readonly depth: number = 1) {
        if (depth < 1) {
            throw new Error('Bad ' + depth);
        } else if (depth === 1) {
            if (root.children.length() < 2) {
                throw new Error('Siblings expected on the deepest level: ' + root.children);
            }
        } else {
            if (root.children.length() !== 1) {
                throw new Error('Siblings cannot be on levels other than deeper: ' + root.children);
            }
        }
    }

    createWithParent(parent: TagNode): SiblingsSubtree {
        return new SiblingsSubtree(parent.copyWithSingleChild(this.root), this.depth + 1);
    }

    unfold(): {path: Vector<TagNode>, siblings: Vector<TagNode>} {
        const path = Vector.unfoldRight<TagNode | undefined, TagNode>(
            this.root,
            n => Option.of(n).map(n => [n, n.tagChildren.single().getOrUndefined()])
        );

        if (path.isEmpty()) {
            return {path: Vector.empty(), siblings: Vector.empty()};
        }

        return {path, siblings: path.last().getOrThrow().tagChildren};
    }
}

export function getSiblingsSubtree(root: TagNode): SiblingsSubtree | null {
    if (!root.tagChildren.length) {
        return null;
    }

    const childrenSubtrees = root.tagChildren
        .map(getSiblingsSubtree)
        .filter(s => s != null) as Vector<SiblingsSubtree>;

    if (childrenSubtrees.length()) {
        return randomItem(childrenSubtrees).createWithParent(root);
    }

    if (root.tagChildren.length() > 1) {
        return new SiblingsSubtree(root);
    }

    return null;
}
