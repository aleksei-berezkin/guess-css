import { Node, TagNode } from './nodes';
import { Rule } from './cssRules';
import { Region } from './region';
import { Indent } from './indent';
import { randomBounded } from '../util';
import { Stream, stream, streamOf } from 'fluent-streams';
import { ColorVar } from './gen/vars';

export type RulesParam = ConstructorParameters<typeof Puzzler>[1];

export class Puzzler {
    readonly correctChoice: number;

    constructor(
            private readonly body: TagNode,
            readonly rules: {
                choices: Rule[][],
                common: Rule[],
                vars: {
                    contrastColor: string,
                    colors: readonly ColorVar[],
                }
            },
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
        return stream(this.rules.common)
            .flatMap(r => r.declarations)
            .map(({property}) => property)
            .toArray();
    }

    get bodyCode(): Region[][] {
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
