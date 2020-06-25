import { ColorVar, ColorVarType } from '../model/gen/colorVar';
import { randomItem } from '../util';
import { stream } from '../stream/stream';
import { PaletteType } from '@material-ui/core';
import blue from '@material-ui/core/colors/blue';
import blueGrey from '@material-ui/core/colors/blueGrey';
import red from '@material-ui/core/colors/red';

export type AssignedColorVar = ColorVar & {
    [paletteType in PaletteType]: string;
};

type Hue = 'red' | 'blue' | 'gray';

const colors: {
    [hue in Hue]: {
        [paletteType in PaletteType]: {
            [colorType in ColorVarType]: string;
        }
    }
} = {
    red: {
        light: {
            background: red[200],
            border: red[600],
        },
        dark: {
            background: red[700],
            border: red[200],
        }
    },
    blue: {
        light: {
            background: blue[200],
            border: blue[600],
        },
        dark: {
            background: blue[700],
            border: blue[200],
        }
    },
    gray: {
        light: {
            background: blueGrey[200],
            border: blueGrey[500],
        },
        dark: {
            background: blueGrey[400],
            border: blueGrey[200],
        },
    }
};

const compatibleColors: [Hue, Hue][] = [
    ['red', 'blue'],
    ['red', 'gray'],
];

export function assignColorVars(vars: readonly ColorVar[]): AssignedColorVar[] {
    if (!vars.length) {
        return [];
    }

    const doAssign = (hue: Hue, colorVar: ColorVar): AssignedColorVar => {
        return {
            ...colorVar,
            light: colors[hue].light[colorVar.type],
            dark: colors[hue].dark[colorVar.type],
        };
    }

    if (vars.length === 1) {
        const hues = Object.getOwnPropertyNames(colors) as Hue[];
        return [doAssign(randomItem(hues), vars[0])];
    }

    if (vars.length === 2) {
        return stream(compatibleColors)
            .randomItem()
            .flatMap(h => h)
            .zipStrict(vars)
            .shuffle()
            .map(([h, p]) => doAssign(h, p))
            .toArray();
    }

    throw new Error('Bad length: ' + vars.length);
}
