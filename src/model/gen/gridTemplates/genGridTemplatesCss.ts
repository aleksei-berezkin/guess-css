import { TagNode } from '../../nodes';
import { CssRules } from '../../puzzler';
import { continually, stream, streamOf } from 'fluent-streams';
import { Rule, TypeSelector } from '../../cssRules';
import { body100percentNoMarginRule, borderAndTextUpCenterRule, fontRule } from '../commonRules';
import { contrastColorVar } from '../vars';

export function genGridTemplatesCss(body: TagNode, rowNum: number, colNum: number): CssRules {
    return {
        choices: createChoices(body, rowNum, colNum),
        common: [
            borderAndTextUpCenterRule,
            body100percentNoMarginRule,
            fontRule,
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
    if (tracksNum === 4) {
        const trackListItems = streamOf(
            ['2fr', '50%', 'repeat(2, 1fr)'],
            ['1fr', '50%', 'repeat(2, 2fr)'],
            ['2fr', '1fr', 'repeat(2, 25%)'],
            ['1fr', 'repeat(3, 20%)'],
            ['50%', 'repeat(3, 10%)'],
        ).randomItem().get();

        return stream(trackListItems)
            .shuffle()
            .join(' ');
    }

    return streamOf('50%', '1fr', '2fr', '3fr')
        .takeRandom(tracksNum)
        .join(' ');
}

function genSimpleTemplate(tracksNum: number) {
    return `repeat(${tracksNum}, 1fr)`;
}
