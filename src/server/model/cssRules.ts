import * as R from 'ramda';
import { Region, RegionKind } from '../../shared/api';
import { Indent } from './indent';
import { Vector } from 'prelude-ts';

export class Rule {
    constructor(
        private readonly selectorsGroup: Selector | Combinator,
        private readonly declarations: { [k: string]: string },
        private readonly selectorsDiffering: boolean = false) {
    }

    toUnformattedCode() {
        return this.selectorsGroup.toString() + '{' + this.declarationsToString() + '}';
    }

    private declarationsToString(): string {
        return Vector.ofIterable(R.toPairs(this.declarations))
            .map(([name, value]) => `${name}: ${value};`)
            .mkString(' ');
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
        ([name, value]: [string, string]): Region[] =>
                [
                    indent,
                    {kind: RegionKind.DeclName, text: name},
                    {kind: RegionKind.Default, text: ': '},
                    ((): Region => {
                        if (name === 'background-color') {
                            return {kind: RegionKind.DeclValue, text: value, backgroundColor: value};
                        }
                        return {kind: RegionKind.DeclValue, text: value};
                    })(),
                    {kind: RegionKind.Default, text: ';'},
                ]
        )(R.toPairs(this.declarations));
    }
}

export abstract class Selector {
    // noinspection JSUnusedLocalSymbols
    private readonly _nominal: any;
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
    private readonly _nominal: any;
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
