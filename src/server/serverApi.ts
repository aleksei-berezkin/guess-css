import { genPuzzler } from './model/bodyGen';
import { Puzzler, Registry } from './puzzlerRegistry';
import * as R from 'ramda';
import { ChoiceCode, CorrectChoiceResponse, PuzzlerSpec, Method, Region } from '../shared/api';
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
        const responseBean: PuzzlerSpec = {
            id,
            choicesCount: puzzler.rulesChoices.length,
            token,
        };

        res.send(JSON.stringify(responseBean));
    });

    app.get(`/${ Method.PUZZLER }`, (req: Request, res: Response) => {
        const puzzler = registry.getPuzzler(getId(req), getToken(req));
        if (!puzzler) {
            res.status(404);
            res.send();
            return;
        }

        const styleText: string = R.pipe(
            R.map((r: Rule) => r.toUnformattedCode()),
            R.join(''),
        )(puzzler.rulesChoices[puzzler.correctChoice]);

        // noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
        res.send(`<html><head><style>${styleText}</style></head>${puzzler.body.toUnformattedCode()}</html>`);
    });

    app.get(`/${ Method.CHOICE}`, (req: Request, res: Response) => {
        const puzzler = registry.getPuzzler(getId(req), getToken(req));
        const choice = getChoice(req);
        if (!puzzler || !hasChoice(puzzler, choice)) {
            res.status(404);
            res.send();
            return;
        }

        const choiceFormatted: ChoiceCode = new TagNode('html', [], [
            new TagNode('head', [], [
                new TagNode('style', [], [
                    new StylesNode(puzzler.rulesChoices[choice])
                ])
            ]),
            puzzler.body,
        ]).toRegions(new Indent());

        res.send(JSON.stringify(choiceFormatted));
    });

    app.get(`/${ Method.CORRECT_CHOICE }`, (req: Request, res: Response) => {
        const id = getId(req);
        const puzzler = registry.getPuzzler(id, getToken(req));
        if (!puzzler) {
            res.status(404);
            res.send();
            return;
        }

        const correctChoiceResponse: CorrectChoiceResponse = puzzler.correctChoice;
        res.send(JSON.stringify(correctChoiceResponse));
    });

    function getId(req: Request): string {
        return req.query['id'];
    }

    function getChoice(req: Request): number {
        return Number.parseInt(req.query['choice']);
    }

    function getToken(req: Request): string {
        return req.query['token'];
    }

    function hasChoice(puzzler: Puzzler, choice: number) {
        return !Number.isNaN(choice) && 0 <= choice && choice < puzzler.rulesChoices.length;
    }
}

class StylesNode implements Node {
    readonly children: Node[] = [];

    constructor(private readonly rules: Rule[]) {
    }

    copyWithSingleChild(child: Node): Node {
        throw new Error('Unsupported');
    }

    toRegions(indent: Indent): Region[][] {
        return R.pipe(
            R.map((rule: Rule) => rule.toRegions(indent)),
            R.unnest,
        )(this.rules);
    }

    toUnformattedCode(): string {
        throw new Error('Unsupported');
    }
}