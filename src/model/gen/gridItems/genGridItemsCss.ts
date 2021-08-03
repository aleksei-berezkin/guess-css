import { ClassSelector, Rule, TypeSelector } from '../../cssRules';
import { TagNode } from '../../nodes';
import { CssRules } from '../../puzzler';
import { body100percentNoMarginRule, borderAndTextUpCenterRule, fontRule } from '../commonRules';
import { contrastColorVar, getColorVar } from '../vars';
import { range, stream } from 'fluent-streams';
import { randomBounded } from '../randomItems';

export function genGridItemsCss(body: TagNode, rowNum: number, colNum: number): CssRules {
    const colorVar = getColorVar('background', 0);
    return {
        choices: createChoices(body, colorVar.id, rowNum, colNum),
        common: [
            new Rule(new TypeSelector('body'), [
                {property: 'display', value: 'grid'},
                {property: 'grid-template-columns', value: `repeat(${colNum}, 1fr)`},
            ]),
            borderAndTextUpCenterRule,
            body100percentNoMarginRule,
            fontRule,
        ],
        vars: {
            contrastColor: contrastColorVar,
            colors: [colorVar],
        },
    }
}

type ItemProperty = 'grid-row' | 'grid-column';
const itemProperties: ItemProperty[] = ['grid-row', 'grid-column'];

function createChoices(body: TagNode, colorVar: string, rowNum: number, colNum: number): Rule[][] {
    const pickedItem = pickItem(body, rowNum, colNum);
    return range(0, 999)
        .map(i => i < 2 ? itemProperties[i] : itemProperties[Math.round(Math.random())])
        .map(property => genChoice(pickedItem, colorVar, property, rowNum, colNum))
        .distinctBy(rs => rs.map(r => r.toUnformattedCode()).join(''))
        .filter(rs => !rs.map(r => r.toUnformattedCode()).some(c => c.includes('/ span 1')))
        .take(3)
        .toArray();
}

type PickedItem = {
    className: string,
    row: number,
    col: number,
}

function pickItem(body: TagNode, rowNum: number, colNum: number): PickedItem {
    const row = randomBounded(rowNum);
    const col = randomBounded(colNum);
    const node = body.children[row * colNum + col];

    return {
        className: stream((node as TagNode).classes).single().get(),
        row,
        col,
    };
}

const valSubtypes = ['From', 'FromTo', 'FromNegTo', 'FromSpan'] as const;

function genChoice(pickedItem: PickedItem, colorVar: string, property: ItemProperty, rowNum: number, colNum: number): Rule[] {
    const valueSubtype = stream(valSubtypes).randomItem().get();

    const pickedItemLine = (property === 'grid-row' ? pickedItem.row : pickedItem.col) + 1;
    const tracksNum = property === 'grid-row' ? rowNum : colNum;

    const value = valueSubtype === 'From' ? genFrom(pickedItemLine, tracksNum)
        : valueSubtype === 'FromTo' ? genFromTo(pickedItemLine, tracksNum)
        : valueSubtype === 'FromNegTo' ? genFromNegTo(pickedItemLine, tracksNum)
        : valueSubtype === 'FromSpan' ? genFromSpan(pickedItemLine, tracksNum)
        : undefined as never;

    return [
        new Rule(
            new ClassSelector(pickedItem.className),
            [
                {property, value, differing: true, propDiffering: true},
                {property: 'background-color', value: colorVar},
            ],
        ),
    ];
}

function genFrom(pickedItemLine: number, tracksNum: number) {
    const from = linesRange(tracksNum)
        .filter(l => l !== pickedItemLine)
        .randomItem()
        .get();
    return String(from);
}

function genFromTo(pickedItemLine: number, tracksNum: number) {
    const [from, to] = genFromToLineNumbers(pickedItemLine, tracksNum);
    return `${from} / ${to}`;
}

function genFromNegTo(pickedItemLine: number, tracksNum: number) {
    const [from, to] = genFromToLineNumbers(pickedItemLine, tracksNum);
    return `${from} / ${to - (tracksNum + 2)}`;
}

function genFromSpan(pickedItemLine: number, tracksNum: number) {
    const [from, to] = genFromToLineNumbers(pickedItemLine, tracksNum);
    return `${from} / span ${to - from}`;
}

function genFromToLineNumbers(pickedItemLine: number, tracksNum: number): [number, number] {
    const [from, to] = linesRange(tracksNum)
        .takeRandom(2)
        .sort();
    if (from === pickedItemLine && to === from + 1) {
        return genFromToLineNumbers(pickedItemLine, tracksNum);
    }
    return [from, to];
}

function linesRange(tracksNum: number) {
    // 2 tracks have lines: 1, 2, 3
    return range(1, tracksNum + 2);
}