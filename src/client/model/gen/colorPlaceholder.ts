export const contrastColorPlaceholder = '$contrastColor$';

export type ColorType = 'background' | 'border';

export type ColorPlaceholder = {
    type: ColorType,
    id: string,
}

export const getColorPlaceholder = (type: ColorType, i: number): ColorPlaceholder => ({
    type,
    id: `$${type}_${i}$`,
});
