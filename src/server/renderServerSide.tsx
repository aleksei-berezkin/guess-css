import { Request, Response } from 'express';
import { Puzzler } from './model/puzzler';
import { genPuzzler } from './model/genPuzzler';
import { theRegistry } from './registry';
import { createAppStoreWithMiddleware } from '../client/redux/store';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { Puzzler as PuzzlerComponent } from '../client/components/Puzzler';
import React from 'react';
import { readFile } from 'fs';
import path from 'path';
// @ts-ignore
import { ROOT_EL_ID, ROOT_EL_TEXT } from '../shared/template';

const indexHtmlParts = new Promise<[string, string]>((resolve, reject) => {
    readFile(path.resolve(__dirname, '..', '..', 'dist', 'index.html'), (err, data) => {
        if (err) {
            reject(Error(err.toString()));
            return;
        }

        const appTag = new RegExp(`<div id="${ ROOT_EL_ID }">\\s*${ ROOT_EL_TEXT }\\s*</div>`);
        const parts = data.toString().split(appTag);
        if (parts && parts.length === 2) {
            resolve([parts[0], parts[1]]);
        } else {
            reject(Error('Bad index.html'));
        }
    });
}).catch((err: Error) => {
    console.error(err);
    process.exit(1);
});


export function sendRenderedApp(req: Request, res: Response) {
    const puzzler: Puzzler = genPuzzler();
    const {id, token} = theRegistry.putPuzzler(puzzler);

    const state = {
        puzzlers: [
            {
                id,
                token,
                choiceCodes: puzzler.getChoiceCodes(true),
                answer: null,
            },
        ],
        current: 0,
        correctAnswers: 0,
    };

    const appHtml = renderToString(
        <Provider store={ createAppStoreWithMiddleware(state, undefined) }>
            <PuzzlerComponent/>
        </Provider>
    )

    indexHtmlParts.then(([before, after]) => {
        res.send(
            `${ before }
            <div id="${ ROOT_EL_ID }">${ appHtml }</div>
            <script>
                window.__PRELOADED_STATE__ = ${ JSON.stringify(state).replace(/</g, '\\u003c') };
            </script>
            ${ after }`
        );
    })
}
