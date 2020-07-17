import { Rule, TypeSelector } from '../cssRules';
import { contrastColorVar } from './vars';
import { monospaceFontsLines } from '../../util';

// TODO RuleCtx to capture vars and enrich rules
export const globalRule = new Rule(new TypeSelector('body'), [
    {property: 'color', value: contrastColorVar},
    {property: 'font-family', value: monospaceFontsLines},
    {property: 'font-size', value: '13px'},
]);
