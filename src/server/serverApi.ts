import { genPuzzler } from './model/genPuzzler';
import { Registry } from './puzzlerRegistry';
import { CorrectChoiceResponse, GenPuzzlerResponse, Method } from '../shared/api';
import { Express, Request, Response } from 'express';
import { Puzzler } from './model/puzzler';

export default function addApi(app: Express) {
    const registry = new Registry();

    app.post(`/${ Method.GEN_PUZZLER }`, (req: Request, res: Response) => {
        const puzzler: Puzzler = genPuzzler();
        const {id, token} = registry.putPuzzler(puzzler);
        const responseBean: GenPuzzlerResponse = {
            id,
            token,
        };

        res.json(responseBean);
    });

    app.get(`/${ Method.PUZZLER }`, (req: Request, res: Response) => {
        const {id, token} = req.query;
        const puzzler = registry.getPuzzler(id, token);
        if (!puzzler) {
            res.status(404).send();
            return;
        }

        res.send(puzzler.html);
    });

    app.get(`/${ Method.CHOICES }`, (req: Request, res: Response) => {
        const {id, token, diffHint} = req.query;
        console.log(id, token, diffHint);
        const puzzler = registry.getPuzzler(id, token);
        if (!puzzler) {
            res.status(404).send();
            return;
        }

        res.json(puzzler.getChoiceCodes(diffHint === 'true'));
    });

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
