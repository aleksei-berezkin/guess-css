import { ColorVar } from '../model/gen/vars';
import { randomItem } from '../util/randomItem';
import { shuffle } from '../util/shuffle';

export type Hue = 'red' | 'blue' | 'gray' | 'yellow' | 'brown';

export type AssignedColorVar = ColorVar & {
    hue: Hue;
};

const compatibleHues: [Hue, Hue][] = [
    ['red', 'blue'],
    ['red', 'gray'],
    ['blue', 'yellow'],
    ['blue', 'brown'],
];

const allHues = [...new Set(compatibleHues.flatMap(h => h))];

export function assignColorVars(vars: readonly ColorVar[]): AssignedColorVar[] {
    if (!vars.length) {
        return [];
    }

    const doAssign = (hue: Hue, colorVar: ColorVar): AssignedColorVar => {
        return {
            ...colorVar,
            hue,
        };
    }

    if (vars.length === 1) {
        return [doAssign(randomItem(allHues), vars[0])];
    }

    if (vars.length === 2) {
        const hues = shuffle(randomItem(compatibleHues));
        return hues.map((h, ix) => doAssign(h, vars[ix]))
    }

    throw new Error(`Bad length: ${vars}`);
}
