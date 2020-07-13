import express, { Express } from 'express';
import path from 'path';
import { sendRenderedApp } from './renderServerSide';
import { WEB_DEV_PORT } from './portsConfig';
import { routes } from '../client/routes';
import { entriesStream } from '../client/stream/stream';
import { serveLicenses } from './serveLicenses';

if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
    throw new Error(process.env.NODE_ENV);
}

const app: Express = express();

app.all('/index.html', (_, res) => res.redirect('/'));

entriesStream(routes).forEach(
    ([_, route]) => app.get(route, sendRenderedApp)
);

['assets', 'dist'].forEach(
    dir => app.use(express.static(path.resolve(__dirname, '..', '..', dir)))
);

serveLicenses(app);

const port = process.env.PORT || WEB_DEV_PORT;
app.listen(port, () => console.log(`Serving from dist on port ${port}. env=${process.env.NODE_ENV}`));
