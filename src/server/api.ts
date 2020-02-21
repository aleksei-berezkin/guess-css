import { genPuzzler } from './model/bodyGen';
import { Puzzler, Registry } from './puzzlerRegistry';
import * as R from 'ramda';
import { ChoiceFormatted, GenPuzzlerResponse, Region } from '../shared/beans';
import { Node, TagNode } from './model/nodes';
import { Indent } from './model/indent';
import { Rule } from './model/cssRules';
import { Express, Request, Response } from 'express';

export default function addApi(app: Express) {
    const registry = new Registry();

    app.post('/genPuzzler', (req: Request, res: Response) => {
        const puzzler: Puzzler = genPuzzler();
        const {id, token} = registry.putPuzzler(puzzler);
        const responseBean: GenPuzzlerResponse = {
            id,
            choicesCount: puzzler.rulesChoices.length,
            token,
        };

        res.send(JSON.stringify(responseBean));
    });

    app.get('/puzzler', (req: Request, res: Response) => {
        const {id, choice, token} = parse(req);

        const puzzlerChoice = registry.getPuzzlerChoice(id, choice, token);
        if (!puzzlerChoice) {
            res.status(404);
            res.send();
            return;
        }

        const styleText: string = R.pipe(
            R.map((r: Rule) => r.toUnformattedCode()),
            R.join(''),
        )(puzzlerChoice.rules);

        // noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
        res.send(`<html><head><style>${styleText}</style></head>${puzzlerChoice.body.toUnformattedCode()}</html>`);
    });

    app.get('/choiceFormatted', (req: Request, res: Response) => {
        const {id, choice, token} = parse(req);

        const puzzlerChoice = registry.getPuzzlerChoice(id, choice, token);
        if (!puzzlerChoice) {
            res.status(404);
            res.send();
            return;
        }

        const lines = new TagNode('html', [], [
            new TagNode('head', [], [
                new TagNode('style', [], [
                    new StylesNode(puzzlerChoice.rules)
                ])
            ]),
            puzzlerChoice.body,
        ]).toRegions(new Indent());
        res.send(JSON.stringify({lines} as ChoiceFormatted));
    });

    function parse(req: Request): {id: string, choice: number, token: string} {
        const id: string = req.query['id'];
        const choice: number = Number.parseInt(req.query['choice']);
        const token: string = req.query['token'];
        return {id, choice, token};
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
