import { PaletteType } from '@material-ui/core';

export type ResolvedContrastColor = { id: string } & {
    [paletteType in PaletteType]: string;
};

export function resolveContrastColor(id: string): ResolvedContrastColor {
    return {
        id,
        light: 'black',
        dark: 'white',
    };
}
