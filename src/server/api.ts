import { genPuzzler } from './model/bodyGen';
import { Puzzler, Registry } from './puzzlerRegistry';
import * as R from 'ramda';
import { GenPuzzlerResponse, Region } from '../shared/beans';
import { Node, TagNode } from './model/nodes';
import { Indent } from './model/indent';
import { Rule } from './model/cssRules';

export default function addApi(app) {
    const registry = new Registry();

    app.post('/genPuzzler', (req, res) => {
        const puzzler: Puzzler = genPuzzler();
        const id = registry.putPuzzler(puzzler);
        const responseBean: GenPuzzlerResponse = {
            id,
            choicesCount: puzzler.rulesChoices.length,
        };

        res.send(JSON.stringify(responseBean));
    });

    app.get('/puzzler', (req, res) => {
        const id: string = req.query['id'];
        const choice: number = Number.parseInt(req.query['choice']);

        const puzzlerChoice = registry.getPuzzlerChoice(id, choice);
        if (!puzzlerChoice) {
            res.status(404);
            return;
        }

        const styleText: string = R.pipe(
            R.map(r => r.toString()),
            R.join(''),
        )(puzzlerChoice.rules);

        // noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
        res.send(`<html><head><style>${styleText}</style></head>${puzzlerChoice.body.toString()}</html>`);
    });

    app.get('/puzzlerFormatted', (req, res) => {
        const id: string = req.query['id'];
        const choice: number = Number.parseInt(req.query['choice']);

        const puzzlerChoice = registry.getPuzzlerChoice(id, choice);
        if (!puzzlerChoice) {
            res.status(404);
            return;
        }

        res.send(
            JSON.stringify(
                new TagNode('html', [], [
                    new TagNode('head', [], [
                        new TagNode('style', [], [
                            new StylesNode(puzzlerChoice.rules)
                        ])
                    ]),
                    puzzlerChoice.body,
                ]).toRegions(new Indent())
            )
        );
    });
}

class StylesNode implements Node {
    readonly children: Node[] = [];

    constructor(private readonly rules: Rule[]) {
    }

    copyWithChild(child: Node) {
        throw new Error('Unsupported');
    }

    toRegions(indent: Indent): Region[][] {
        return R.pipe(
            R.map((rule: Rule) => rule.toRegions(indent)),
            R.unnest,
        )(this.rules);
    }
}
