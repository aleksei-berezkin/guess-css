import { Region, RegionKind } from './region';
import { Indent } from './indent';
import { Vector } from 'prelude-ts';

export class Rule {
    constructor(
        private readonly selectorsGroup: Selector | Combinator,
        private readonly declarations: Vector<[string, string]>,
        private readonly selectorsDiffering: boolean = false) {
    }

    toUnformattedCode() {
        return this.selectorsGroup.toString() + '{' + this.declarationsToString() + '}';
    }

    private declarationsToString(): string {
        return this.declarations
            .map(([name, value]) => `${name}: ${value};`)
            .mkString(' ');
    }

    toRegions(indent: Indent): Vector<Region[]> {
        return Vector.of<Region[]>(
            [
                indent,
                {kind: RegionKind.Selector, text: this.selectorsGroup.toString(), differing: this.selectorsDiffering},
                {kind: RegionKind.Default, text: ' {'},
            ])
            .appendAll(this.declarationsToRegions(indent.indent()))
            .append([
                indent,
                {kind: RegionKind.Default, text: '}'},
            ]);
    }


    private declarationsToRegions(indent: Indent): Vector<Region[]> {
        return this.declarations
            .map(([name, value]): Region[] =>
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
            );
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
    private readonly selectors: Vector<Selector>;
    constructor(...selectors: Selector[]) {
        super();
        this.selectors = Vector.ofIterable(selectors);
    }
    toString(): string {
        return this.selectors.mkString(' ');
    }
}

export class ChildCombinator extends Combinator {
    private readonly selectors: Vector<Selector>;
    constructor(...selectors: Selector[]) {
        super();
        this.selectors = Vector.ofIterable(selectors);
    }
    toString(): string {
        return this.selectors.mkString('>');
    }
}
