import { Puzzler } from '../../puzzler';
import { randomBounded } from '../randomItems';
import { TagNode } from '../../nodes';
import { genDivs } from '../genDivs';
import { genGridItemsCss } from './genGridItemsCss';

export function genGridItemsPuzzler(): Puzzler {
    const rowNum = randomBounded(2, 4);
    const colNum = randomBounded(3, 5);
    const cellNum = rowNum * colNum;

    function getClassName(i: number): string[] {
        const row = Math.floor(i / colNum);
        const col = i - row * colNum;
        return [`e${row + 1}${col + 1}`];
    }

    const body = new TagNode('body', [], genDivs(cellNum, cellNum, getClassName));
    return new Puzzler(body, genGridItemsCss(body, rowNum, colNum), true);

}
