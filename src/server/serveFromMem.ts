import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';

import config from '../../webpackInMem';
import { WEB_DEV_PORT } from './portsConfig';

if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
    throw new Error(process.env.NODE_ENV);
}

const app = express();
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output!.publicPath!,
}));
app.use(webpackHotMiddleware(compiler))

app.listen(WEB_DEV_PORT, () => console.log(`In-mem server is listening on port ${WEB_DEV_PORT}`));
