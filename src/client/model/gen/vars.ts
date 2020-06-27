import { Rule, TypeSelector } from '../cssRules';

export const contrastColorVar = '$contrastColor$';

export const contrastColorRule = new Rule(new TypeSelector('*'), [['color', contrastColorVar]]);

export type ColorVarType = 'background' | 'border';

export type ColorVar = {
    type: ColorVarType,
    id: string,
}
export const getColorVar = (type: ColorVarType, i: number): ColorVar => ({
    type,
    id: `$${ type }_${ i }$`,
});

export function hasVars(text: string) {
    return text.indexOf('$') > -1;
}
