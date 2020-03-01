import { genPuzzler } from './model/bodyGen';
import { Puzzler, Registry } from './puzzlerRegistry';
import * as R from 'ramda';
import { ChoiceCodes, CorrectChoiceResponse, GenPuzzlerResponse, Method, Region, RegionKind } from '../shared/api';
import { Node, TagNode } from './model/nodes';
import { Indent } from './model/indent';
import { Rule } from './model/cssRules';
import { Express, Request, Response } from 'express';

export default function addApi(app: Express) {
    const registry = new Registry();

    app.post(`/${ Method.GEN_PUZZLER }`, (req: Request, res: Response) => {
        const puzzler: Puzzler = genPuzzler();
        const {id, token} = registry.putPuzzler(puzzler);
        console.log('Id=' + id + ', correct=' + puzzler.correctChoice);
        const responseBean: GenPuzzlerResponse = {
            id,
            token,
        };

        res.send(JSON.stringify(responseBean));
    });

    app.get(`/${ Method.PUZZLER }`, (req: Request, res: Response) => {
        const {id, token} = req.query;
        const puzzler = registry.getPuzzler(id, token);
        if (!puzzler) {
            res.status(404).send();
            return;
        }

        const styleText: string = R.pipe(
            R.map((r: Rule) => r.toUnformattedCode()),
            R.join(''),
        )(puzzler.rulesChoices[puzzler.correctChoice]);

        // noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
        res.send(`<html><head><style>${styleText}</style></head>${puzzler.body.toUnformattedCode()}</html>`);
    });

    app.get(`/${ Method.CHOICES }`, (req: Request, res: Response) => {
        const {id, token, diffHint} = req.query;
        console.log(id, token, diffHint);
        const puzzler = registry.getPuzzler(id, token);
        if (!puzzler) {
            res.status(404).send();
            return;
        }

        const choiceCodes: ChoiceCodes = R.pipe(
            R.range(0),
            R.map(choiceCode(puzzler, diffHint === 'true'))
        )(puzzler.rulesChoices.length);

        res.json(choiceCodes);
    });

    function choiceCode(puzzler: Puzzler, diffHint: boolean): {(choice: number): Region[][]} {
        return (choice: number) =>
            new TagNode('html', [], [
                new TagNode('head', [], [
                    new TagNode('style', [], [
                        new StylesNode(
                            puzzler.rulesChoices[choice],
                            diffHint,
                        )
                    ])
                ]),
                puzzler.body,
            ]).toRegions(new Indent());
    }

    app.get(`/${ Method.CORRECT_CHOICE }`, (req: Request, res: Response) => {
        const {id, token} = req.query;
        const puzzler = registry.getPuzzler(id, token);
        if (!puzzler) {
            res.status(404).send();
            return;
        }

        const correctChoiceResponse: CorrectChoiceResponse = puzzler.correctChoice;
        res.json(correctChoiceResponse);
    });
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
