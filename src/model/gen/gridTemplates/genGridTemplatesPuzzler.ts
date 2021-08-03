import { Puzzler } from '../../puzzler';
import { randomBounded } from '../randomItems';
import { TagNode } from '../../nodes';
import { genDivs } from '../genDivs';
import { genGridTemplatesCss } from './genGridTemplatesCss';

export function genGridTemplatesPuzzler(): Puzzler {
    const rowNum = randomBounded(2, 4);
    const colNum = randomBounded(3, 5);
    const cellNum = rowNum * colNum;

    const body = new TagNode('body', [], genDivs(cellNum, cellNum));
    return new Puzzler(body, genGridTemplatesCss(body, rowNum, colNum), true);

}
