import { randomBounded, randomNumericalEnum } from '../../util';
import { Puzzler } from '../puzzler';
import { Topic } from './topic';
import { genBody } from './genBody';
import { genCssRulesChoices } from './genCss';

export function genPuzzler(): Puzzler {
    const topic = randomNumericalEnum(Topic);

    const body = genBody(topic);
    const rulesChoices = genCssRulesChoices(body, topic);
    if (rulesChoices) {
        return new Puzzler(body, rulesChoices, randomBounded(rulesChoices.length()));
    }

    return genPuzzler();
}
