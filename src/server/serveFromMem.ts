import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';

import config from '../../webpackInMem';
import { WEB_DEV_PORT } from './portsConfig';
import { serveLicenses } from './serveLicenses';
import { routes } from '../client/routes';
import { entryStream } from 'fluent-streams';

if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
    throw new Error(process.env.NODE_ENV);
}

const app = express();
const compiler = webpack(config);

entryStream(routes)
    .map(([_, route]) => route)
    .filter(route => route !== routes.root)
    .forEach(nonRoot => app.get(nonRoot, (_, res) => res.redirect(routes.root)));

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output!.publicPath!,
}));

app.use(webpackHotMiddleware(compiler));

serveLicenses(app);

app.listen(WEB_DEV_PORT, () => console.log(`In-mem server is listening on port ${WEB_DEV_PORT}`));
