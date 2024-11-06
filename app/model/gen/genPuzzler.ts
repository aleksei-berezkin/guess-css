import { Puzzler } from '../puzzler';
import { genSelectorsPuzzler } from './selectors/genSelectorsPuzzler';
import { genDisplayPuzzler } from './display/genDisplayPuzzler';
import { genPositionPuzzler } from './position/genPositionPuzzler';
import { genFlexboxPuzzler } from './flexbox/genFlexboxPuzzler';
import { Topic } from '../topic';
import { genGridTemplatesPuzzler } from './gridTemplates/genGridTemplatesPuzzler';
import { genGridItemsPuzzler } from './gridItems/genGridItemsPuzzler';

export function genPuzzler(topic: Topic, round: number): Puzzler {
    if (topic === 'Display') {
        return genDisplayPuzzler();
    }
    if (topic === 'Flexbox') {
        return genFlexboxPuzzler(round > 0);
    }
    if (topic === 'Position') {
        return genPositionPuzzler();
    }
    if (topic === 'Selectors') {
        return genSelectorsPuzzler();
    }
    if (topic === 'Grid') {
        if (round % 2 === 0) {
            return genGridTemplatesPuzzler();
        }
        return genGridItemsPuzzler();
    }
    throw new Error(String(topic));
}
