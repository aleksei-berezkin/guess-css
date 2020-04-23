import { Rule, TypeSelector } from '../cssRules';
import { Vector } from 'prelude-ts';

export const constantRule = new Rule(
    new TypeSelector('div'),
    Vector.of(['padding', '6px'], ['border', '1px solid black'])
);
