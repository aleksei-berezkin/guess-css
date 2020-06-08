import { TagNode } from '../nodes';
import { Stream, stream } from '../../stream/stream';

export class SingleChildSubtree {
    constructor(readonly root: TagNode, readonly depth: number = 1) {
        if (depth < 1) {
            throw new Error('Bad ' + depth);
        }
        if (root.children.length > 1) {
            throw new Error('Not single child: ' + root.children);
        }
    }

    createWithParent(parent: TagNode): SingleChildSubtree {
        return new SingleChildSubtree(parent.copyWithSingleChild(this.root), this.depth + 1);
    }

    unfold(): TagNode[] {
        return this.unfoldToStream().toArray();
    }

    unfoldToStream(): Stream<TagNode> {
        return stream(function* _unfold(n: TagNode): IterableIterator<TagNode> {
            yield n;
            if (n.tagChildren.length === 1) {
                yield *_unfold(n.tagChildren[0]);
            }
        }(this.root));
        
    }
}

export function getDeepestSingleChildSubtree(root: TagNode): SingleChildSubtree {
    return stream(root.tagChildren)
        .map(getDeepestSingleChildSubtree)
        .groupBy(subtree => subtree.depth)
        .reduce(([d1, s1], [d2, s2]) => d1 > d2 ? [d1, s1] : [d2, s2])
        .flatMap(([_, s]) => s)
        .randomItem()
        .map(s => s.createWithParent(root))
        .orElseGet(() => new SingleChildSubtree(root));
}
