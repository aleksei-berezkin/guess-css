import express from 'express';
import cors from 'cors';
import addApi from './api';

if (process.env.NODE_ENV !== 'development') {
    throw new Error(process.env.NODE_ENV);
}

const apiServerPort = 3001;
const app = express();

app.use(cors());

addApi(app);

app.listen(apiServerPort, () => console.log(`Dev api server is listening on port ${apiServerPort}`));
