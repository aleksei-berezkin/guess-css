import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { Rule } from '../cssRules';
import { Topic } from './topic';
import { genCssFlexbox } from './genCssFlexbox';

export function genCssRulesChoices(body: TagNode, topic: Topic): Vector<Vector<Rule>> | null {
    switch (topic) {
        case Topic.SELECTORS: throw new Error();
        case Topic.DISPLAY: throw new Error();
        case Topic.POSITION: throw new Error();
        case Topic.FLEXBOX: return genCssFlexbox(body);
    }
}
