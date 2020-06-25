import { PaletteType } from '@material-ui/core';

export type AssignedContrastColorVar = { id: string } & {
    [paletteType in PaletteType]: string;
};

export function assignContrastColorVar(id: string): AssignedContrastColorVar {
    return {
        id,
        light: 'black',
        dark: 'white',
    };
}
