import { ColorVar, ColorVarType } from '../model/gen/colorVar';
import { randomItem } from '../util';
import { stream } from '../stream/stream';
import { PaletteType } from '@material-ui/core';

export type AssignedColorVar = ColorVar & {
    [paletteType in PaletteType]: {
        color: string,
        codeText: string,
    }
};

type Hue = 'red' | 'blue' | 'gray';

const colors: {
    [hue in Hue]: {
        [paletteType in PaletteType]: {
            [colorType in ColorVarType]: {
                color: string,
                codeText: string,
            }
        }
    }
} = {
    red: {
        light: {
            background: {
                color: 'pink',
                codeText: 'black',
            },
            border: {
                color: 'red',
                codeText: 'black',
            },
        },
        dark: {
            background: {
                color: 'darkred',
                codeText: 'white',
            },
            border: {
                color: 'pink',
                codeText: 'black',
            },
        }
    },
    blue: {
        light: {
            background: {
                color: 'lightblue',
                codeText: 'black',
            },
            border: {
                color: 'blue',
                codeText: 'white',
            },
        },
        dark: {
            background: {
                color: 'darkblue',
                codeText: 'white',
            },
            border: {
                color: 'lightblue',
                codeText: 'black',
            },
        }
    },
    gray: {
        light: {
            background: {
                color: 'lightgray',
                codeText: 'black',
            },
            border: {
                color: 'gray',
                codeText: 'white',
            },
        },
        dark: {
            background: {
                color: 'darkgray',
                codeText: 'white',
            },
            border: {
                color: 'lightgray',
                codeText: 'black',
            },
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
