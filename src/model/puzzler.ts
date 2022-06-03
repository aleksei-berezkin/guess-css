import { Node, TagNode } from './nodes';
import { Rule } from './cssRules';
import { Region } from './region';
import { Indent } from './indent';
import { ColorVar } from './gen/vars';
import { randomBounded } from './gen/randomItems';

export type CssRules = {
    choices: Rule[][],
    common: Rule[],
    vars: {
        contrastColor: string,
        colors: readonly ColorVar[],
    },
};

export class Puzzler {
    readonly correctChoice: number;

    constructor(
            private readonly body: TagNode,
            readonly rules: CssRules,
            private readonly showBodyTag = false,
    ) {
        this.correctChoice = randomBounded(rules.choices.length);
    }

    get html(): string {
        const styleText = [...this.rules.choices[this.correctChoice], ...this.rules.common]
            .map(r => r.toUnformattedCode())
            .join('');

        // noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
        return `<html><head><style>${ styleText }</style></head>${ this.body.toUnformattedCode() }</html>`;
    }

    getStyleCodes(diffHint: boolean): Region[][][] {
        return this.rules.choices
            .map(choice => new StylesNode(choice, diffHint).toRegions(new Indent()));
    }

    get commonStyleCode(): Region[][] {
        return new StylesNode(this.rules.common, false).toRegions(new Indent());
    }

    get commonStyleSummary(): string[] {
        return this.rules.common
            .flatMap(r => r.declarations)
            .map(({property}) => property);
    }

    get bodyCode(): Region[][] {
        if (this.showBodyTag) {
            return this.body.toRegions(new Indent());
        }
        return this.body.children
            .flatMap(n => n.toRegions(new Indent()));
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
            return [
                [
                    indent.toRegion(),
                    {
                        kind: 'comment',
                        text: '/* Only text in ',
                    },
                    {
                        kind: 'comment',
                        text: 'bold',
                        differing: true,
                    },
                    {
                        kind: 'comment',
                        text: ' differs */',
                    },
                ],
                ...this.doToRegions(indent)
            ];
        }

        return this.doToRegions(indent);
    }

    private doToRegions(indent: Indent): Region[][] {
        return this.rules
            .flatMap(rule => rule.toRegions(indent));
    }

    toUnformattedCode(): string {
        throw new Error('Unsupported');
    }
}
