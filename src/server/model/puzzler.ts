import { Node, TagNode } from './nodes';
import { Rule } from './cssRules';
import * as R from 'ramda';
import { ChoiceCode, Region, RegionKind } from '../../shared/api';
import { Indent } from './indent';

export class Puzzler {
    constructor(
        private readonly body: TagNode,
        private readonly rulesChoices: Rule[][],
        readonly correctChoice: number) {
    }

    get html(): string {
        const styleText: string = R.pipe(
            R.map((r: Rule) => r.toUnformattedCode()),
            R.join(''),
        )(this.rulesChoices[this.correctChoice]);

        // noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
        return `<html><head><style>${styleText}</style></head>${this.body.toUnformattedCode()}</html>`;
    }

    getChoiceCodes(diffHint: boolean): ChoiceCode[] {
        return R.pipe(
            R.range(0),
            R.map(this.choiceCode(diffHint))
        )(this.rulesChoices.length);
    };

    private choiceCode(diffHint: boolean): {(choice: number): Region[][]} {
        return (choice: number) =>
            new TagNode('html', [], [
                new TagNode('head', [], [
                    new TagNode('style', [], [
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
