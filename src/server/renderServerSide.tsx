import { Request, Response } from 'express';
import { Puzzler } from '../client/model/puzzler';
import { genPuzzler } from '../client/model/gen/genPuzzler';
import { createAppStoreWithMiddleware, State } from '../client/redux/store';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { Puzzler as PuzzlerComponent } from '../client/components/puzzler';
import React from 'react';
import { readFile } from 'fs';
import path from 'path';
import { ROOT_EL_ID, ROOT_EL_TEXT } from '../shared/appWideConst';
import { PRELOADED_STATE_ID } from '../shared/preloadedStateId';
import { getRandomizedTopics } from '../client/model/gen/topic';

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
    const topics = getRandomizedTopics();
    const puzzler: Puzzler = genPuzzler(topics[0]);
    const state: State = {
        topics,
        puzzlerViews: [{
            source: puzzler.html,
            styleChoices: puzzler.getStyleCodes(true),
            commonStyle: puzzler.commonStyleCode,
            commonStyleSummary: puzzler.commonStyleSummary,
            body: puzzler.bodyCode,
            correctChoice: puzzler.correctChoice,
            userChoice: undefined as number | undefined,
        }],
        current: 0,
        correctAnswers: 0,
        footerBtnHeight: null,
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
                window.${ PRELOADED_STATE_ID } = ${ JSON.stringify(state) };
            </script>
            ${ after }`
        );
    })
}
