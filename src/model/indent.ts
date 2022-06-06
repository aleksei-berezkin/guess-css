import { Region, regionKind } from './region';

const indentSize = 2;

export class Indent {
    readonly text: string;

    constructor(indent: number = 0) {
        this.text = Array.from({length: indent}).map(() => ' ').join('');
    }

    indent(): Indent {
        return new Indent(this.text.length + indentSize);
    }

    toRegion(): Region {
        return [this.text, regionKind.default];
    }
}
