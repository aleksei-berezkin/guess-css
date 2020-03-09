import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpack from 'webpack';

// @ts-ignore
import config from '../../webpack.config.dev';
// @ts-ignore
import { PORT } from './ports.config';

if (process.env.NODE_ENV !== 'development') {
    throw new Error(process.env.NODE_ENV);
}

const app = express();
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
}));

app.listen(PORT, () => console.log(`Dev web server is listening on port ${PORT}`));
