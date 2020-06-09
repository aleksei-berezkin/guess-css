import express, { Express } from 'express';
import path from 'path';
import { sendRenderedApp } from './renderServerSide';
import { WEB_DEV_PORT } from './portsConfig';

if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
    throw new Error(process.env.NODE_ENV);
}

const app: Express = express();

app.get('/', sendRenderedApp);
app.get('/index.html', sendRenderedApp);

app.use(express.static(path.resolve(__dirname, '..', '..', 'dist')));

const port = process.env.PORT || WEB_DEV_PORT;
app.listen(port, () => console.log(`Serving from dist on port ${port}. env=${process.env.NODE_ENV}`));