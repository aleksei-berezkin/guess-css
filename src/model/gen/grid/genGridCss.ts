import { TagNode } from '../../nodes';
import { CssRules } from '../../puzzler';
import { continually, streamOf } from 'fluent-streams';
import { Rule, TypeSelector } from '../../cssRules';
import { body100percentNoMarginRule, fontRule } from '../commonRules';
import { contrastColorVar } from '../vars';

export function genGridCss(body: TagNode, rowNum: number, colNum: number): CssRules {
    return {
        choices: createChoices(body, rowNum, colNum),
        common: [
            fontRule,
            body100percentNoMarginRule,
            new Rule(
                new TypeSelector('div'),
                [
                    {property: 'border', value: `1px solid ${ contrastColorVar }`},
                    {property: 'text-align', value: 'center'},
                ]
            ),
        ],
        vars: {
            contrastColor: contrastColorVar,
            colors: [],
        },
    }
}

function createChoices(body: TagNode, rowNum: number, colNum: number): Rule[][] {
    const dim = rowNum < 3 ? 'col'
        : Math.random() < .5 ? 'row' : 'col';

    const trackNum = dim === 'row' ? rowNum : colNum;
    const templateProperty = dim === 'row' ? 'grid-template-rows' : 'grid-template-columns'
    const simpleColumnsTemplate =
        dim === 'row'
            ? [{property: 'grid-template-columns', value: ['', genSimpleTemplate(colNum)]}]
            : [];

    return continually(() => genTemplate(trackNum))
        .distinctBy(t => t)
        .take(3)
        .map(template => [
            new Rule(
                new TypeSelector('body'),
                [
                    {property: 'display', value: 'grid'},
                    ...simpleColumnsTemplate,
                    {
                        property: templateProperty,
                        value: ['', template],
                        differing: true,
                    },
                ],
            ),
        ])
        .toArray();
}

function genTemplate(tracksNum: number) {
    return streamOf('50%', '1fr', '2fr', '3fr')
        .takeRandom(tracksNum)
        .join(' ');
}

function genSimpleTemplate(tracksNum: number) {
    return `repeat(${tracksNum}, 1fr)`;
}
