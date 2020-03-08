import express, { Express } from 'express';
import path from 'path';
import addApi from './serverApi';
import { sendRenderedApp } from './renderServerSide';

if (process.env.NODE_ENV !== 'production') {
    throw new Error(process.env.NODE_ENV);
}

const port = process.argv[process.argv.length - 1];
const app: Express = express();

app.get('/', sendRenderedApp);
app.get('/index.html', sendRenderedApp);

app.use(express.static(path.resolve(__dirname, '..', '..', 'dist')));

addApi(app);

app.listen(port, () => console.log(`Prod server is listening on port ${port}`));
