import { Express } from 'express';
import licenses from '../../generated/licenses.json';

export function serveLicenses(app: Express) {
    app.get('/licenses', (req, res) => {
        const name = String(req.query['name']);
        if (name in licenses) {
            res.send((licenses as any)[name]);
        } else {
            res.sendStatus(404);
        }
    })
}
