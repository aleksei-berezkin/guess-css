import { Node, TagNode } from './nodes';
import { Rule } from './cssRules';
import * as R from 'ramda';
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
        return `<html><head><style>${styleText}</style></head>${this.body.toUnformattedCode()}</html>`;
    }

    getChoiceCodes(diffHint: boolean): ChoiceCode[] {
        return range(0, this.rulesChoices.length)
            .map(this.choiceCode(diffHint))
            .toArray();
    };

    private choiceCode(diffHint: boolean): {(choice: number): Region[][]} {
        return (choice: number) =>
            new TagNode('html', Vector.empty(), [
                new TagNode('head', Vector.empty(), [
                    new TagNode('style', Vector.empty(), [
                        new StylesNode(
                            this.rulesChoices[choice],
                            diffHint,
                        )
                    ])
                ]),
                this.body,
            ]).toRegions(new Indent());
    }
}


class StylesNode implements Node {
    readonly children: Node[] = [];

    constructor(private readonly rules: Rule[], private readonly isDiffHint: boolean) {
    }

    copyWithSingleChild(child: Node): Node {
        throw new Error('Unsupported');
    }

    toRegions(indent: Indent): Region[][] {
        if (this.isDiffHint) {
            return [
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
                ],
                ...this.doToRegions(indent),
            ];
        }

        return this.doToRegions(indent);
    }

    private doToRegions(indent: Indent): Region[][] {
        return R.pipe(
            R.map((rule: Rule) => rule.toRegions(indent)),
            R.unnest,
        )(this.rules);
    }

    toUnformattedCode(): string {
        throw new Error('Unsupported');
    }
}
