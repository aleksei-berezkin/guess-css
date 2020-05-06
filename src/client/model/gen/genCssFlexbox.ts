import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { Rule, TypeSelector } from '../cssRules';

export function genCssFlexbox(body: TagNode): Vector<Vector<Rule>> | null {
    const choiceRules = Vector.of(
        new Rule(
            new TypeSelector('div'),
            Vector.of(
                ['padding', '.5em'],
                ['border', '1px solid black'],
            )
        ),
        new Rule(
            new TypeSelector('body'),
            Vector.of(['display', 'flex']),
        ),
    );
    return Vector.of(choiceRules, choiceRules, choiceRules);
}
