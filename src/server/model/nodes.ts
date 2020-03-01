import * as R from 'ramda';
import { Region, RegionKind } from '../../shared/api';
import { Indent } from './indent';

export interface Node {
    readonly children: Node[];
    copyWithSingleChild(child: Node): Node;
    toRegions(indent: Indent): Region[][];
    toUnformattedCode(): string;
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

    copyWithSingleChild(child: Node): TagNode {
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
        const classesRegions = this.classesToRegions();
        if (!classesRegions.length) {
            return [{kind: RegionKind.Tag, text: `<${this.name}>`}];
        }

        return [
            {kind: RegionKind.Tag, text: `<${this.name}`},
            ...classesRegions,
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

    private childrenToRegions(indent: Indent): Region[][] {
        return R.pipe(
            R.map((child: Node): Region[][] => child.toRegions(indent)),
            R.unnest
        )(this.children);
    }

    toUnformattedCode(): string {
        return `<${this.name}${this.classesAttrToString()}>${this.childrenToUnformattedCode()}</${this.name}>`;
    }

    private classesAttrToString(): string {
        if (!this.classList.length) {
            return '';
        }

        return ` class="${R.join(' ')(this.classList)}"`;
    }

    private childrenToUnformattedCode(): string {
        return R.pipe(
            R.map((child: Node) => child.toUnformattedCode()),
            R.join(''),
        )(this.children);
    }
}

export class TextNode implements Node {
    readonly children = [];

    constructor(public text: string) {
    }

    copyWithSingleChild(child: Node): Node {
        throw new Error('Not supported');
    }

    toUnformattedCode(): string {
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
