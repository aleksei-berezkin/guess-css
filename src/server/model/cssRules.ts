import * as R from 'ramda';
import { Region, RegionKind } from '../../shared/beans';
import { Indent } from './indent';

export class Rule {
    constructor(
        private readonly selectorsGroup: Selector | Combinator,
        private readonly declarations: { [k: string]: string },
        private readonly selectorsDiffering: boolean = false) {
    }

    toString() {
        return this.selectorsGroup.toString() + '{' + this.declarationsToString() + '}';
    }

    private declarationsToString(): string {
        return R.pipe(
            R.map(([name, value]): string => `${name}: ${value};`),
            R.join(' '),
        )(R.toPairs(this.declarations));
    }

    toRegions(indent: Indent): Region[][] {
        return [
            [
                indent,
                {kind: RegionKind.Selector, text: this.selectorsGroup.toString(), differing: this.selectorsDiffering},
                {kind: RegionKind.Default, text: ' {'},
            ],
            ...this.declarationsToRegions(indent.indent()),
            [
                indent,
                {kind: RegionKind.Default, text: '}'},
            ]
        ];
    }


    private declarationsToRegions(indent: Indent): Region[][] {
        return R.map(
        ([name, value]): Region[] =>
                [
                    indent,
                    {kind: RegionKind.DeclName, text: name},
                    {kind: RegionKind.Default, text: ': '},
                    {kind: RegionKind.DeclValue, text: value},
                    {kind: RegionKind.Default, text: ';'},
                ]
        )(R.toPairs(this.declarations));
    }
}

export abstract class Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _nominal: void;
    abstract toString(): string;
}

export class TypeSelector extends Selector {
    constructor(public readonly type: string) {
        super();
    }
    toString(): string {
        return this.type;
    }
}

export class ClassSelector extends Selector {
    constructor(public readonly clazz: string) {
        super();
    }
    toString(): string {
        return '.' + this.clazz;
    }
}

export class PseudoClassSelector extends Selector {
    constructor(public readonly base: TypeSelector | ClassSelector, public readonly pseudoClass: string) {
        super();
    }
    toString(): string {
        return `${ this.base.toString() }:${ this.pseudoClass }`;
    }
}

export abstract class Combinator {
    // noinspection JSUnusedLocalSymbols
    private readonly _nominal: void;
    abstract toString(): string;
}


export class DescendantCombinator extends Combinator {
    private readonly selectors: Selector[];
    constructor(...selectors: Selector[]) {
        super();
        this.selectors = selectors;
    }
    toString(): string {
        return R.join(' ', R.map(s => s.toString(), this.selectors));
    }
}

export class ChildCombinator extends Combinator {
    private readonly selectors: Selector[];
    constructor(...selectors: Selector[]) {
        super();
        this.selectors = selectors;
    }
    toString(): string {
        return R.join('>', R.map(s => s.toString(), this.selectors));
    }
}
