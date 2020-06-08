import { Region, RegionKind } from './region';
import { Indent } from './indent';
import { stream, streamOf } from '../stream/stream';

export interface Node {
    readonly children: Node[];
    copyWithSingleChild(child: Node): Node;
    toRegions(indent: Indent): Region[][];
    toUnformattedCode(): string;
}

export class TagNode implements Node {
    name: string;
    classes: string[];
    children: Node[];

    private _tagChildren: TagNode[] | undefined;

    constructor(name: string, classes: string[], children: Node[]) {
        this.name = name;
        this.classes = classes;
        this.children = children;
    }

    get tagChildren(): TagNode[] {
        if (!this._tagChildren) {
            this._tagChildren = this.children.filter(c => c instanceof TagNode) as TagNode[];
        }
        return this._tagChildren;
    }

    copyWithSingleChild(child: Node): TagNode {
        return new TagNode(this.name, this.classes, [child]);
    }

    toRegions(indent: Indent): Region[][] {
        if (this.children.length === 1 && this.children[0] instanceof TextNode) {
            const textNode = this.children[0] as TextNode;
            return [
                [indent, ...this.openTagToRegions(), textNode.toTextRegion(), this.closeTagToRegion()]
            ];
        }

        return streamOf([indent, ...this.openTagToRegions()])
            .appendAll(this.childrenToRegions(indent.indent()))
            .append([indent, this.closeTagToRegion()])
            .toArray();
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
        if (!this.classes.length) {
            return [];
        }

        return [
            {kind: RegionKind.Default, text: ' '},
            {kind: RegionKind.AttrName, text: 'class'},
            {kind: RegionKind.Operator, text: '="'},
            {kind: RegionKind.AttrValue, text: this.classes.join(' ')},
            {kind: RegionKind.Operator, text: '"'},
        ];
    }

    private closeTagToRegion(): Region {
        return {kind: RegionKind.Tag, text: `</${this.name}>`};
    }

    private childrenToRegions(indent: Indent): Region[][] {
        return stream(this.children)
            .flatMap(node => node.toRegions(indent))
            .toArray();
    }

    toUnformattedCode(): string {
        return `<${this.name}${this.classesAttrToString()}>${this.childrenToUnformattedCode()}</${this.name}>`;
    }

    private classesAttrToString(): string {
        if (!this.classes.length) {
            return '';
        }

        return ` class="${this.classes.join(' ')}"`;
    }

    private childrenToUnformattedCode(): string {
        return this.children
            .map(node => node.toUnformattedCode())
            .join('');
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
        return {kind: RegionKind.Text, text: this.text};
    }
}
