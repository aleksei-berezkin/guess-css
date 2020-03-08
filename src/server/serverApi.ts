import { genPuzzler } from './model/genPuzzler';
import { theRegistry } from './registry';
import { CorrectChoiceResponse, GenPuzzlerResponse, Method } from '../shared/api';
import { Express, Request, Response } from 'express';
import { Puzzler } from './model/puzzler';

export default function addApi(app: Express) {
    app.post(`/${ Method.GEN_PUZZLER }`, (req: Request, res: Response) => {
        const {diffHint} = req.query;

        const puzzler: Puzzler = genPuzzler();
        const {id, token} = theRegistry.putPuzzler(puzzler);

        const responseBean: GenPuzzlerResponse = {
            id,
            token,
            choiceCodes: puzzler.getChoiceCodes(diffHint === 'true'),
        };

        res.json(responseBean);
    });

    app.get(`/${ Method.PUZZLER }`, (req: Request, res: Response) => {
        const {id, token} = req.query;
        const puzzler = theRegistry.getPuzzler(id, token);
        if (!puzzler) {
            res.status(404).send();
            return;
        }

        res.send(puzzler.html);
    });

    app.get(`/${ Method.CORRECT_CHOICE }`, (req: Request, res: Response) => {
        const {id, token} = req.query;
        const puzzler = theRegistry.getPuzzler(id, token);
        if (!puzzler) {
            res.status(404).send();
            return;
        }

        const correctChoiceResponse: CorrectChoiceResponse = puzzler.correctChoice;
        res.json(correctChoiceResponse);
    });
}
