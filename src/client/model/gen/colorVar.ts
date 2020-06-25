export type ColorVarType = 'background' | 'border';

export type ColorVar = {
    type: ColorVarType,
    id: string,
}

export const getColorVar = (type: ColorVarType, i: number): ColorVar => ({
    type,
    id: `$${type}_${i}$`,
});
