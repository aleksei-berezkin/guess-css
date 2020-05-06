import { TagNode } from '../nodes';
import { Vector } from 'prelude-ts';
import { Rule } from '../cssRules';
import { Topic } from './topic';
import { genCssSelectorsRulesChoices } from './genCssSelectors';
import { genCssDisplay } from './genCssDisplay';
import { genCssPosition } from './genCssPosition';
import { genCssFlexbox } from './genCssFlexbox';

export function genCssRulesChoices(body: TagNode, topic: Topic): Vector<Vector<Rule>> | null {
    switch (topic) {
        case Topic.SELECTORS: return genCssSelectorsRulesChoices(body);
        case Topic.DISPLAY: return genCssDisplay(body);
        case Topic.POSITION: return genCssPosition(body);
        case Topic.FLEXBOX: return genCssFlexbox(body);
    }
}
