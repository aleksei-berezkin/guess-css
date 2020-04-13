import { Region, RegionKind } from './region';
import * as R from 'ramda';
import { Vector } from 'prelude-ts';

const indentSize = 2;

export class Indent implements Region {
    readonly kind: RegionKind = RegionKind.Default;
    readonly text: string;

    constructor(indent: number = 0) {
        this.text = Vector.ofIterable(R.repeat(' ', indent)).mkString('');
    }

    indent(): Indent {
        return new Indent(this.text.length + indentSize);
    }
}
