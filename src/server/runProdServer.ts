import express, { Express } from 'express';
import path from 'path';
import addApi from './serverApi';
import { sendRenderedApp } from './renderServerSide';
// @ts-ignore
import { PORT } from './ports.config';

if (process.env.NODE_ENV !== 'production') {
    throw new Error(process.env.NODE_ENV);
}

const app: Express = express();

app.get('/', sendRenderedApp);
app.get('/index.html', sendRenderedApp);

app.use(express.static(path.resolve(__dirname, '..', '..', 'dist')));

addApi(app);

app.listen(PORT, () => console.log(`Prod server is listening on port ${PORT}`));
