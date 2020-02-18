import * as R from 'ramda';
import { Region, RegionKind } from '../../shared/beans';
import { Indent } from './indent';

export interface Node {
    readonly children: Node[];
    copyWithChild(child: Node);
    toRegions(indent: Indent): Region[][];
    toString(): string;
}

export class TagNode implements Node {
    name: string;
    classList: string[] = [];
    children: Node[] = [];

    private _tagChildren: TagNode[] | null = null;

    constructor(name: string, classes: string[], children: Node[]) {
        this.name = name;
        this.classList = classes;
        this.children = children;
    }

    get tagChildren(): TagNode[] {
        if (!this._tagChildren) {
            this._tagChildren = R.filter(c => c instanceof TagNode, this.children) as TagNode[];
        }
        return this._tagChildren;
    }

    copyWithChild(child: Node): TagNode {
        return new TagNode(this.name, this.classList, [child]);
    }

    toRegions(indent: Indent): Region[][] {
        if (this.children.length === 1 && this.children[0] instanceof TextNode) {
            const textNode = this.children[0] as TextNode;
            return [
                [indent, ...this.openTagToRegions(), textNode.toTextRegion(), this.closeTagToRegion()]
            ];
        }

        return [
            [indent, ...this.openTagToRegions()],
            ...this.childrenToRegions(indent.indent()),
            [indent, this.closeTagToRegion()],
        ];
    }

    private openTagToRegions(): Region[] {
        return [
            {kind: RegionKind.Tag, text: `<${this.name}`},
            ...this.classesToRegions(),
            {kind: RegionKind.Tag, text: `>`},
        ];
    }

    private classesToRegions(): Region[] {
        if (!this.classList.length) {
            return [];
        }

        return [
            {kind: RegionKind.Default, text: ' '},
            {kind: RegionKind.AttrName, text: 'class'},
            {kind: RegionKind.Operator, text: '="'},
            {kind: RegionKind.AttrValue, text: R.join(' ')(this.classList)},
            {kind: RegionKind.Operator, text: '"'},
        ];
    }

    private closeTagToRegion(): Region {
        return {kind: RegionKind.Tag, text: `</${this.name}>`};
    }

    private childrenToRegions(indent): Region[][] {
        return R.pipe(
            R.map((child: Node): Region[][] => child.toRegions(indent)),
            R.unnest
        )(this.children);
    }

    toString(): string {
        let str = `<${this.name}`;
        if (this.classList && this.classList.length) {
            str += ` class="${this.classList.join(' ')}"`;
        }
        str += '>';
        for (const child of this.children) {
            str += child.toString();
        }
        str += `</${this.name}>`;
        return str;
    }
}

export class TextNode implements Node {
    readonly children = [];

    constructor(public text: string) {
    }

    copyWithChild(child: Node) {
        return new TextNode(this.text);
    }

    toString(): string {
        return this.text;
    }

    toRegions(indent: Indent): Region[][] {
        return [
            [indent, this.toTextRegion()]
        ];
    }

    toTextRegion(): Region {
        return {kind: RegionKind.Default, text: this.text};
    }
}
