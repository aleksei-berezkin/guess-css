import { Region, RegionKind } from '../../shared/beans';
import * as R from 'ramda';

const indentSize = 2;

export class Indent implements Region {
    readonly kind: RegionKind = RegionKind.Default;
    readonly text: string;

    constructor(indent: number = 0) {
        this.text = R.pipe(
            R.repeat(' '),
            R.join(''),
        )(indent);
    }

    indent(): Indent {
        return new Indent(this.text.length + indentSize);
    }
}
