import express, { Express } from 'express';
import path from 'path';
import addApi from './serverApi';
import { sendRenderedApp } from './renderServerSide';
// @ts-ignore
import { WEB_DEV_PORT, PROD_PORT } from './ports.config';

if (process.env.NODE_ENV === 'development') {
    console.warn('WARNING: Production runs in dev mode');
} else if (process.env.NODE_ENV !== 'production') {
    throw new Error(process.env.NODE_ENV);
}

const app: Express = express();

app.get('/', sendRenderedApp);
app.get('/index.html', sendRenderedApp);

app.use(express.static(path.resolve(__dirname, '..', '..', 'dist')));

addApi(app);

const port = process.env.NODE_ENV === 'production' ? PROD_PORT : WEB_DEV_PORT;
app.listen(port, () => console.log(`Prod server is listening on port ${port}`));
