import { TagNode } from '../../nodes';
import { Vector } from 'prelude-ts';
import { ClassSelector, Declaration, Rule, Selector } from '../../cssRules';
import { getNShuffled, randomBounded, randomItemsInOrder } from '../../../util';
import { getSiblingsSubtree } from '../siblingsSubtree';

const displays = Vector.of('inline', 'block', 'inline-block');

export function genDisplayCss(body: TagNode): Vector<Vector<Rule>> {
    const {path, siblings} = getSiblingsSubtree(body)!.unfold();
    const [displays1, displays2, displays3] = getNShuffled(displays, 3);

    const parentSelector = getClassSelector(path.last().getOrThrow());
    const parentRules = displays1
        .map(d => new Rule(parentSelector, Vector.of(
            ['display', d, true],
            ['background-color', 'pink']
        )));

    const [children1, children2] = splitChildren(siblings);

    const [width1, width2] = Vector.of(`${ 5 * randomBounded(6, 17) }%`, undefined).shuffle();

    const children1Rules = displays2.map(childrenToRule(children1, width1));
    const children2Rules = displays3.map(childrenToRule(children2, width2));

    return parentRules.zip(children1Rules).zip(children2Rules)
        .map(([[ruleParent, rule1], rule2]) => Vector.of(ruleParent, rule1, rule2));
}

function splitChildren(children: Vector<TagNode>): [Vector<TagNode>, Vector<TagNode>] {
    if (children.length() < 2) {
        throw Error('Length=' + children.length());
    }

    const someChildren = randomItemsInOrder(children, randomBounded(1, children.length()));
    const otherChildren = children.filter(n => someChildren.find(m => n === m).isNone());

    // It's more convenient when order of rules is similar to the order of children, at least for first
    if (someChildren.head().getOrThrow().classes < otherChildren.head().getOrThrow().classes) {
        return [someChildren, otherChildren];
    }
    return [otherChildren, someChildren];
}

function childrenToRule(children: Vector<TagNode>, width: string | undefined): (display: string) => Rule {
    return display => new Rule(
        children.map(getClassSelector),
        Vector.of<Declaration>(
            ['display', display, true],
            ['border', '4px solid blue'],
        ).transform(
            decl => width ? decl.append(['width', width]) : decl
        )
    );
}

function getClassSelector(node: TagNode): Selector {
    return new ClassSelector(node.classes.single().getOrThrow());
}
