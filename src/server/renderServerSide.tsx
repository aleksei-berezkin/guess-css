import { Request, Response } from 'express';
import { Puzzler } from '../client/model/puzzler';
import { genPuzzler } from '../client/model/gen/genPuzzler';
import { createAppStore, State } from '../client/redux/store';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { Puzzler as PuzzlerComponent } from '../client/components/puzzler';
import React from 'react';
import { readFile } from 'fs';
import path from 'path';
import { SCRIPT_PLACEHOLDER, STYLE_PLACEHOLDER, APP_PLACEHOLDER } from '../shared/templateConst';
import { PRELOADED_STATE_ID } from '../shared/preloadedStateId';
import { getRandomizedTopics } from '../client/model/gen/topic';
import ServerStyleSheets from '@material-ui/styles/ServerStyleSheets';

const indexHtmlParts = new Promise<[string, string, string, string]>((resolve, reject) => {
    readFile(path.resolve(__dirname, '..', '..', 'dist', 'index.html'), (err, data) => {
        if (err) {
            reject(Error(err.toString()));
            return;
        }

        const re = new RegExp(
            `^(.+)${ escape(SCRIPT_PLACEHOLDER) }(.+)${ escape(STYLE_PLACEHOLDER) }(.+)${ escape(APP_PLACEHOLDER) }(.+)$`,
            's'
        );
        const parts = re.exec(String(data));
        if (parts?.length === 5) {
            resolve([parts[1], parts[2], parts[3], parts[4]]);
        } else {
            reject(Error('Bad index.html'));
        }
    });
}).catch((err: Error) => {
    console.error(err);
    process.exit(1);
});

function escape(re: string) {
    return re.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

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
            status: {
                correctChoice: puzzler.correctChoice,
                userChoice: undefined,
            },
            currentTab: 0,
        }],
        current: 0,
        correctAnswers: 0,
        footerBtnHeight: null,
    };

    const sheets = new ServerStyleSheets();

    const app = renderToString(
        sheets.collect(
            <Provider store={ createAppStore(state) }>
                <PuzzlerComponent/>
            </Provider>
        )
    );

    indexHtmlParts.then((parts) => {
        res.send(
            `${ parts[0] }window.${ PRELOADED_STATE_ID } = ${ JSON.stringify(state) };
            ${ parts[1] }${ sheets.toString() }
            ${ parts[2] }${ app }${ parts[3] }`
        );
    });
}
