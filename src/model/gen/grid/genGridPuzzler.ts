import { Puzzler } from '../../puzzler';
import { randomBounded } from '../randomItems';
import { TagNode } from '../../nodes';
import { genDivs } from '../genDivs';
import { genGridCss } from './genGridCss';

export function genGridPuzzler(): Puzzler {
    const rowNum = randomBounded(2, 4);
    const colNum = randomBounded(3, 5);
    const cellNum = rowNum * colNum;

    const body = new TagNode('body', [], genDivs(cellNum, cellNum, true));
    return new Puzzler(body, genGridCss(body, rowNum, colNum), true);

}
