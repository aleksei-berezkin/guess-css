import { Node, TagNode } from './nodes';
import { Rule } from './cssRules';
import { Region, RegionKind } from './region';
import { Indent } from './indent';
import { randomBounded } from '../util';
import { Stream, stream, streamOf } from '../stream/stream';

export class Puzzler {
    readonly correctChoice: number;

    constructor(
            private readonly body: TagNode,
            private readonly rulesChoices: Rule[][],
            private readonly showBodyTag = false,
            
    ) {
        this.correctChoice = randomBounded(rulesChoices.length);
    }

    get html(): string {
        const styleText = this.rulesChoices[this.correctChoice]
            .map(r => r.toUnformattedCode())
            .join('');

        // noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
        return `<html><head><style>${ styleText }</style></head>${ this.body.toUnformattedCode() }</html>`;
    }

    getStyleCodes(diffHint: boolean): Region[][][] {
        return this.rulesChoices
            .map(choice => new StylesNode(choice, diffHint).toRegions(new Indent()));
    }

    getBodyCode(): Region[][] {
        if (this.showBodyTag) {
            return this.body.toRegions(new Indent());
        }
        return stream(this.body.children)
            .flatMap(n => n.toRegions(new Indent()))
            .toArray();
    }
}

class StylesNode implements Node {
    readonly children = [];

    constructor(private readonly rules: Rule[], private readonly isDiffHint: boolean) {
    }

    copyWithSingleChild(child: Node): Node {
        throw new Error('Unsupported');
    }

    toRegions(indent: Indent): Region[][] {
        if (this.isDiffHint) {
            return streamOf<Region[]>([
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
            ])
                .appendAll(this.doToRegions(indent))
                .toArray();
        }

        return this.doToRegions(indent).toArray();
    }

    private doToRegions(indent: Indent): Stream<Region[]> {
        return stream(this.rules)
            .flatMap(rule => rule.toRegions(indent));
    }

    toUnformattedCode(): string {
        throw new Error('Unsupported');
    }
}
