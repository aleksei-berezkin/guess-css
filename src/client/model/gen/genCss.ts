import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { Rule } from '../cssRules';
import { Topic } from './topic';
import { genCssSelectorsRulesChoices } from './genCssSelectors';
import { genCssDisplay } from './genCssDisplay';

export function genCssRulesChoices(body: TagNode, topic: Topic): Vector<Vector<Rule>> | null {
    switch (topic) {
        case Topic.SELECTORS: return genCssSelectorsRulesChoices(body);
        case Topic.DISPLAY: return genCssDisplay(body);
    }
}
