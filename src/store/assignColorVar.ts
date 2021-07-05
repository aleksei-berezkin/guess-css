import { randomItem } from '../util';
import { stream } from 'fluent-streams';
import { ColorVar } from '../model/gen/vars';

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

const allHues = stream(compatibleHues)
    .flatMap(h => h)
    .distinctBy(h => h)
    .toArray();

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
        return stream(compatibleHues)
            .randomItem()
            .flatMapToStream(h => h)
            .shuffle()
            .zipStrict(vars)
            .map(([h, v]) => doAssign(h, v))
            .toArray();
    }

    throw new Error('Bad length: ' + vars.length);
}
