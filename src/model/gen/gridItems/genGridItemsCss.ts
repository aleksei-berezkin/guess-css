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
        choices: createChoices(body, rowNum, colNum, colorVar.id),
        common: [
            new Rule(new TypeSelector('body'), [
                {property: 'display', value: 'grid'},
                {property: 'grid-template-columns', value: ['', `repeat(${colNum}, 1fr)`]},
                {property: 'grid-template-rows', value: ['', `repeat(${rowNum}, 1fr)`]},
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

function createChoices(body: TagNode, rowNum: number, colNum: number, colorVar: string, ): Rule[][] {
    const pickedItem = pickItem(body, rowNum, colNum);
    const spans = gen3Spans(pickedItem, rowNum, colNum);

    return stream(spans).shuffle()
        .map(span => genChoice(pickedItem.className, span, rowNum, colNum, colorVar))
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

class Span {
    constructor(
        readonly horizontal: boolean,
        readonly from: {row: number, col: number},
        readonly size: number
    ) {}
    fromLine() {
        return (this.horizontal ? this.from.col : this.from.row) + 1;
    }
    toLine() {
        return this.fromLine() + this.size;
    }
}

function gen3Spans(pickedItem: PickedItem, rowNum: number, colNum: number) {
    for ( ; ; ) {
        const spans = stream(genSpans(pickedItem, rowNum, colNum))
            .take(10)
            .filterWithAssertion((s): s is Span => !!s)
            .take(3)
            .toArray();
        if (spans.length === 3) {
            return spans;
        }
    }
}

function* genSpans(pickedItem: PickedItem, rowNum: number, colNum: number) {
    const grid = range(0, rowNum)
        .map(() => range(0, colNum).map(() => false as boolean).toArray())
        .toArray();

    grid[pickedItem.row][pickedItem.col] = true;

    function isOccupied(rc: number[]) {
        const [r, c] = rc;
        const row = grid[r];
        return row && row[c];
    }

    function markOccupied(rc: number[]) {
        const [r, c] = rc;
        for ( ; ; ) {
            const row = grid[r];
            if (row) {
                row[c] = true;
                break;
            }
            grid.push(range(0, colNum).map(() => false as boolean).toArray());
        }
    }
    function addToGridIfNotAlready(span: Span) {
        const cells = range(0, span.size)
            .map(i => span.horizontal
                ? [span.from.row, span.from.col + i]
                : [span.from.row + i, span.from.col]
            );

        if (cells.any(isOccupied)) {
            return false;
        }

        cells.forEach(markOccupied);
        return true;
    }

    let horizontal = Math.random() < .5;
    for ( ; ; ) {
        let row = horizontal ? pickedItem.row : randomBounded(rowNum);
        let col = horizontal ? randomBounded(colNum) : pickedItem.col;

        if (horizontal && col < pickedItem.col) {
            row++;
        } else if (!horizontal && row >= pickedItem.row) {
            col = 0;
        }

        const from = {
            row: (horizontal && col < pickedItem.col) ? row + 1 : row,
            col,
        };

        const maxSize = horizontal ? colNum - from.col : rowNum - from.row;
        const size = randomBounded(1, maxSize + 1);
        const span = new Span(horizontal, from, size);
        if (addToGridIfNotAlready(span)) {
            yield span;
            horizontal = !horizontal;
        } else {
            yield null;
        }
    }
}

function genChoice(itemClassName: string, span: Span, rowNum: number, colNum: number, colorVar: string): Rule[] {
    return [
        new Rule(
            new ClassSelector(itemClassName),
            [
                {
                    property: span.horizontal ? 'grid-column' : 'grid-row',
                    value: genValue(span, rowNum, colNum),
                    differing: true,
                    propDiffering: true,
                },
                {property: 'background-color', value: colorVar},
            ],
        ),
    ];
}

function genValue(span: Span, rowNum: number, colNum: number) {
    if (span.size === 1 && Math.random() < .5) {
        return String(span.fromLine());
    }

    if (Math.random() < .33) {
        return `${span.fromLine()} / ${span.toLine()}`;
    }

    if (Math.random() < .5) {
        return `${span.fromLine()} / span ${span.size}`;
    }

    const lastLine = (span.horizontal ? colNum : rowNum) + 1;
    return `${span.fromLine()} / ${span.toLine() - (lastLine + 1)}`;
}
