import { ColorPlaceholder, ColorType } from '../model/gen/colorPlaceholder';
import { escapeRe, randomItem } from '../util';
import { stream } from '../stream/stream';
import { PaletteType } from '@material-ui/core';

export type ResolvedColor = ColorPlaceholder & {
    [paletteType in PaletteType]: {
        color: string,
        codeText: string,
    }
};

type Hue = 'red' | 'blue' | 'gray';

const colors: {
    [hue in Hue]: {
        [paletteType in PaletteType]: {
            [colorType in ColorType]: {
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

export function resolveColors(placeholders: readonly ColorPlaceholder[]): ResolvedColor[] {
    if (!placeholders.length) {
        return [];
    }

    const doResolve = (hue: Hue, placeholder: ColorPlaceholder): ResolvedColor => {
        return {
            ...placeholder,
            light: colors[hue].light[placeholder.type],
            dark: colors[hue].dark[placeholder.type],
        };
    }

    if (placeholders.length === 1) {
        const hues = Object.getOwnPropertyNames(colors) as Hue[];
        return [doResolve(randomItem(hues), placeholders[0])];
    }

    if (placeholders.length === 2) {
        return stream(compatibleColors)
            .randomItem()
            .flatMap(h => h)
            .zipStrict(placeholders)
            .shuffle()
            .map(([h, p]) => doResolve(h, p))
            .toArray();
    }

    throw new Error('Bad length: ' + placeholders.length);
}
