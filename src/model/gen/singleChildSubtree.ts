import { TagNode } from '../nodes';
import { randomItem } from '../../util/randomItem';
import { getItemsWithMax } from '../../util/getItemsWithMax';

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
        return [...this.unfoldToItr()];
    }

    *unfoldToItr(): IterableIterator<TagNode> {
        yield* (function* _unfold(n: TagNode): IterableIterator<TagNode> {
            yield n;
            if (n.tagChildren.length === 1) {
                yield *_unfold(n.tagChildren[0]);
            }
        }(this.root));
        
    }
}

export function getDeepestSingleChildSubtree(root: TagNode): SingleChildSubtree {
    if (!root.tagChildren.length) {
        return new SingleChildSubtree(root);
    }

    const deepestSingleChildSubtrees = root.tagChildren
        .map(getDeepestSingleChildSubtree);

    const deepestSingleChildSubtree = randomItem(
        getItemsWithMax(deepestSingleChildSubtrees, st => st.depth),
    );

    return deepestSingleChildSubtree.createWithParent(root);
}
