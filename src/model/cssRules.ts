import { Region } from './region';
import { Indent } from './indent';

export type Declaration = {
    property: string,
    value: string | string[],
    differing?: boolean,
    propDiffering?: boolean,
};

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
            .map(({property, value}) => `${property}: ${Rule.valueToString(value)};`)
            .join(' ');
    }

    private static valueToString(value: Declaration['value']): string {
        if (typeof value === 'string') {
            return value;
        }

        return value.join(' ');
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
        return [
            [
                indent.toRegion(),
                {kind: 'selector', text: this.selectorsString, differing: this.selectorsDiffering},
                {kind: 'default', text: ' {'}
            ],
            ...this.declarationsToRegions(indent.indent()),
            [
                indent.toRegion(),
                {kind: 'default', text: '}'},
            ],
        ];
    }


    private declarationsToRegions(indent: Indent): Region[][] {
        return this.declarations
            .flatMap(decl => this.declarationToLines(decl, indent))
    }

    private declarationToLines(decl: Declaration, indent: Indent): Region[][] {
        return (typeof decl.value === 'string' ? [decl.value] : decl.value)
            .map((v, i, arr) => {
                const line: Region[] = [];
                if (i === 0) {
                    line.push(
                        indent.toRegion(),
                        {kind: 'declName', text: decl.property, differing: decl.propDiffering},
                        {kind: 'default', text: ': '},
                    );
                } else {
                    line.push(
                        indent.indent().toRegion(),
                    );
                }
                line.push({kind: 'declValue', text: v, differing: decl.differing});
                if (i === arr.length - 1) {
                    line.push({kind: 'default', text: ';'});
                }
                return line;
            });
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
