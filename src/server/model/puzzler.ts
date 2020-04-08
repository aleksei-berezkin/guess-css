import { Node, TagNode } from './nodes';
import { Rule } from './cssRules';
import { ChoiceCode, Region, RegionKind } from '../../shared/api';
import { Indent } from './indent';
import { Vector } from 'prelude-ts';
import { range } from '../../shared/util';

export class Puzzler {
    constructor(
        private readonly body: TagNode,
        private readonly rulesChoices: Rule[][],
        readonly correctChoice: number) {
    }

    get html(): string {
        const styleText = Vector.ofIterable(this.rulesChoices[this.correctChoice])
            .map(r => r.toUnformattedCode())
            .mkString('');

        // noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
        return `<html><head><style>${ styleText }</style></head>${ this.body.toUnformattedCode() }</html>`;
    }

    getChoiceCodes(diffHint: boolean): ChoiceCode[] {
        return range(0, this.rulesChoices.length)
            .map(choice => this.choiceCode(diffHint, choice).toArray())
            .toArray();
    };

    private choiceCode(diffHint: boolean, choice: number): Vector<Region[]> {
        return new TagNode('html', Vector.empty(), Vector.of(
            new TagNode('head', Vector.empty(), Vector.of(
                new TagNode('style', Vector.empty(), Vector.of(
                    new StylesNode(
                        this.rulesChoices[choice],
                        diffHint,
                    )
                ))
            )),
            this.body,
        )).toRegions(new Indent());
    }
}

class StylesNode implements Node {
    readonly children: Vector<Node> = Vector.empty();

    constructor(private readonly rules: Rule[], private readonly isDiffHint: boolean) {
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
        return Vector.ofIterable(this.rules)
            .flatMap(rule => rule.toRegions(indent));
    }

    toUnformattedCode(): string {
        throw new Error('Unsupported');
    }
}
