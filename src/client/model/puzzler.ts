import { Node, TagNode } from './nodes';
import { Rule } from './cssRules';
import { Region, RegionKind } from './region';
import { Indent } from './indent';
import { Vector } from 'prelude-ts';
import { randomBounded } from '../util';

export class Puzzler {
    readonly correctChoice: number;

    constructor(
            private readonly body: TagNode,
            private readonly rulesChoices: Vector<Vector<Rule>>,
            private readonly showBodyTag = false,
            
    ) {
        this.correctChoice = randomBounded(rulesChoices.length());
    }

    get html(): string {
        const styleText = this.rulesChoices.get(this.correctChoice).getOrThrow()
            .map(r => r.toUnformattedCode())
            .mkString('');

        // noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
        return `<html><head><style>${ styleText }</style></head>${ this.body.toUnformattedCode() }</html>`;
    }

    getStyleCodes(diffHint: boolean): Vector<Vector<Region[]>> {
        return this.rulesChoices
            .map(choice => new StylesNode(choice, diffHint).toRegions(new Indent()));
    }

    getBodyCode(): Vector<Region[]> {
        if (this.showBodyTag) {
            return this.body.toRegions(new Indent());
        }
        return this.body.children.flatMap(n => n.toRegions(new Indent()));
    }
}

class StylesNode implements Node {
    readonly children: Vector<Node> = Vector.empty();

    constructor(private readonly rules: Vector<Rule>, private readonly isDiffHint: boolean) {
    }

    copyWithSingleChild(child: Node): Node {
        throw new Error('Unsupported');
    }

    toRegions(indent: Indent): Vector<Region[]> {
        if (this.isDiffHint) {
            return Vector.of<Region[]>(
                [
                    indent,
                    {
                        kind: RegionKind.Comment,
                        text: '/* Only text in ',
                    },
                    {
                        kind: RegionKind.Comment,
                        text: 'bold',
                        differing: true,
                    },
                    {
                        kind: RegionKind.Comment,
                        text: ' differs */',
                    },
                ]
            ).appendAll(this.doToRegions(indent));
        }

        return this.doToRegions(indent);
    }

    private doToRegions(indent: Indent): Vector<Region[]> {
        return this.rules
            .flatMap(rule => rule.toRegions(indent));
    }

    toUnformattedCode(): string {
        throw new Error('Unsupported');
    }
}
