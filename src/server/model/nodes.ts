import { Region, RegionKind } from '../../shared/api';
import { Indent } from './indent';
import { Vector } from 'prelude-ts';

export interface Node {
    readonly children: Vector<Node>;
    copyWithSingleChild(child: Node): Node;
    toRegions(indent: Indent): Region[][];
    toUnformattedCode(): string;
}

export class TagNode implements Node {
    name: string;
    classes: Vector<string>;
    children: Vector<Node>;

    private _tagChildren: Vector<TagNode> | undefined;

    constructor(name: string, classes: Vector<string>, children: Vector<Node>) {
        this.name = name;
        this.classes = classes;
        this.children = children;
    }

    get tagChildren(): Vector<TagNode> {
        if (!this._tagChildren) {
            this._tagChildren = this.children.filter(c => c instanceof TagNode) as Vector<TagNode>;
        }
        return this._tagChildren;
    }

    copyWithSingleChild(child: Node): TagNode {
        return new TagNode(this.name, this.classes, Vector.of(child));
    }

    toRegions(indent: Indent): Region[][] {
        if (this.children.single().filter(c => c instanceof TextNode).isSome()) {
            const textNode = this.children.single().getOrThrow() as TextNode;
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
        if (this.classes.isEmpty()) {
            return [];
        }

        return [
            {kind: RegionKind.Default, text: ' '},
            {kind: RegionKind.AttrName, text: 'class'},
            {kind: RegionKind.Operator, text: '="'},
            {kind: RegionKind.AttrValue, text: this.classes.mkString(' ')},
            {kind: RegionKind.Operator, text: '"'},
        ];
    }

    private closeTagToRegion(): Region {
        return {kind: RegionKind.Tag, text: `</${this.name}>`};
    }

    private childrenToRegions(indent: Indent): Region[][] {
        return Vector.ofIterable(this.children)
            .map(node => node.toRegions(indent))
            // Vector<Region[][]> => Vector<Region[]>
            .flatMap(Vector.ofIterable)
            .toArray();
    }

    toUnformattedCode(): string {
        return `<${this.name}${this.classesAttrToString()}>${this.childrenToUnformattedCode()}</${this.name}>`;
    }

    private classesAttrToString(): string {
        if (this.classes.isEmpty()) {
            return '';
        }

        return ` class="${this.classes.mkString(' ')}"`;
    }

    private childrenToUnformattedCode(): string {
        return Vector.ofIterable(this.children)
            .map(node => node.toUnformattedCode())
            .mkString('');
    }
}

export class TextNode implements Node {
    readonly children = Vector.empty<Node>();

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
