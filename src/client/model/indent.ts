import { Region, RegionKind } from './region';
import { same } from '../stream/stream';

const indentSize = 2;

export class Indent {
    readonly text: string;

    constructor(indent: number = 0) {
        this.text = same(' ').take(indent).join('');
    }

    indent(): Indent {
        return new Indent(this.text.length + indentSize);
    }

    toRegion(): Region {
        return {
            kind: RegionKind.Default,
            text: this.text,
        }
    }
}
