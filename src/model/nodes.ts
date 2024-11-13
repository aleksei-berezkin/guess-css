import { Region, regionKind as kind } from './region';
import { Indent } from './indent';

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
                [indent.toRegion(), ...this.openTagToRegions(), textNode.toTextRegion(), ...this.closeTagToRegions()]
            ];
        }

        return [
            [indent.toRegion(), ...this.openTagToRegions()],
            ...this.childrenToRegions(indent.indent()),
            [indent.toRegion(), ...this.closeTagToRegions()],
        ];
    }

    private openTagToRegions(): Region[] {
        return [
            ['<', kind.tagBracket],
            [this.name, kind.tag],
            ...this.classesToRegions(),
            ['>', kind.tagBracket],
        ];
    }

    private classesToRegions(): Region[] {
        if (!this.classes.length) {
            return [];
        }

        return [
            [' ', kind.default],
            ['class', kind.attrName],
            ['="', kind.operator],
            [this.classes.join(' '), kind.attrValue],
            ['"', kind.operator],
        ];
    }

    private closeTagToRegions(): Region[] {
        return [
            ['</', kind.tagBracket],
            [this.name, kind.tag],
            ['>', kind.tagBracket],
        ];
    }

    private childrenToRegions(indent: Indent): Region[][] {
        return this.children
            .flatMap(node => node.toRegions(indent));
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    copyWithSingleChild(child: Node): Node {
        throw new Error('Not supported');
    }

    toUnformattedCode(): string {
        return this.text;
    }

    toRegions(indent: Indent): Region[][] {
        return [
            [indent.toRegion(), this.toTextRegion()]
        ];
    }

    toTextRegion(): Region {
        return [this.text, kind.text];
    }
}
