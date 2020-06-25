import { Rule, TypeSelector } from '../cssRules';

export const contrastColorVar = '$contrastColor$';

export const contrastColorRule = new Rule(new TypeSelector('*'), [['color', contrastColorVar]]);
