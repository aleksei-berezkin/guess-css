import { Rule, TypeSelector } from '../cssRules';
import { contrastColorVar } from './vars';
import { monospaceFontsLines } from '../../monospaceFonts';

export const fontRule = new Rule(new TypeSelector('body'), [
    {property: 'color', value: contrastColorVar},
    {property: 'font-family', value: monospaceFontsLines},
    {property: 'font-size', value: '13px'},
]);

export const body100percentNoMarginRule = new Rule(
    [new TypeSelector('html'), new TypeSelector('body')],
    [
        {property: 'height', value: '100%'},
        {property: 'margin', value: '0'},
    ],
);

export const borderAndTextUpCenterRule = new Rule(
    new TypeSelector('div'),
    [
        {property: 'border', value: `1px solid ${ contrastColorVar }`},
        {property: 'text-align', value: 'center'},
    ]
);
