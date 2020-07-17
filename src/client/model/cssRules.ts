import { Region } from './region';
import { Indent } from './indent';
import { streamOf } from '../stream/stream';

export type Declaration = readonly [
    string,
    string,
    boolean?
];

export class Rule {
    private _selectorsString?: string;

    constructor(
        private readonly selectors: Selector | Selector[],
        readonly declarations: Declaration[],
        private readonly selectorsDiffering: boolean = false) {
    }

    toUnformattedCode() {
        return this.selectorsString + '{' + this.declarationsToString() + '}';
    }

    private declarationsToString(): string {
        return this.declarations
            .map(([name, value]) => `${name}: ${value};`)
            .join(' ');
    }

    get selectorsString() {
        if (this._selectorsString == undefined) {
            if (Array.isArray(this.selectors)) {
                this._selectorsString = this.selectors
                    .map(sel => sel.toString())
                    .join(', ');
            } else {
                this._selectorsString = this.selectors.toString();
            }
        }
        return this._selectorsString;
    }

    toRegions(indent: Indent): Region[][] {
        return streamOf<Region[]>([
                indent.toRegion(),
                {kind: 'selector', text: this.selectorsString, differing: this.selectorsDiffering},
                {kind: 'default', text: ' {'},
            ])
            .appendAll(this.declarationsToRegions(indent.indent()))
            .append([
                indent.toRegion(),
                {kind: 'default', text: '}'},
            ])
            .toArray();
    }


    private declarationsToRegions(indent: Indent): Region[][] {
        return this.declarations
            .map(([name, value, differing]): Region[] =>
                [
                    indent.toRegion(),
                    {kind: 'declName', text: name},
                    {kind: 'default', text: ': '},
                    {kind: 'declValue', text: value, differing},
                    {kind: 'default', text: ';'},
                ]
            );
    }
}

export abstract class Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _nominal: any;
    abstract toString(): string;
}

export class TypeSelector extends Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _n_ts: any;
    constructor(public readonly type: string) {
        super();
    }
    toString(): string {
        return this.type;
    }
}

export class ClassSelector extends Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _n_cs: any;
    constructor(public readonly clazz: string) {
        super();
    }
    toString(): string {
        return '.' + this.clazz;
    }
}

export class PseudoClassSelector extends Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _n_pcs: any;
    constructor(public readonly base: TypeSelector | ClassSelector, public readonly pseudoClass: string) {
        super();
    }
    toString(): string {
        return `${ this.base.toString() }:${ this.pseudoClass }`;
    }
}

export class DescendantCombinator extends Selector {
    private readonly selectors: Selector[];
    constructor(...selectors: Selector[]) {
        super();
        this.selectors = selectors;
    }
    toString(): string {
        return this.selectors.join(' ');
    }
}

export class ChildCombinator extends Selector {
    private readonly selectors: Selector[];
    constructor(...selectors: Selector[]) {
        super();
        this.selectors = selectors;
    }
    toString(): string {
        return this.selectors.join('>');
    }
}
