import { Rule, TypeSelector } from '../cssRules';
import { contrastColorVar } from './vars';

// TODO RuleCtx to capture vars and enrich rules
export const globalRule = new Rule(new TypeSelector('body'), [
    ['color', contrastColorVar],
    ['font-family', 'Menlo, monospace'],
    ['font-size', '13px'],
]);
