import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpack from 'webpack';

import config from '../../webpackConfDev';
import { WEB_DEV_PORT } from './portsConfig';

if (process.env.NODE_ENV !== 'development') {
    throw new Error(process.env.NODE_ENV);
}

const app = express();
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output!.publicPath!,
}));

app.listen(WEB_DEV_PORT, () => console.log(`Dev web server is listening on port ${WEB_DEV_PORT}`));
