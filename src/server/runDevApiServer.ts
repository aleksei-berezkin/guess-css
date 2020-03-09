import express from 'express';
import cors from 'cors';
import addApi from './serverApi';
// @ts-ignore
import { API_DEV_PORT } from './ports.config';

if (process.env.NODE_ENV !== 'development') {
    throw new Error(process.env.NODE_ENV);
}

const app = express();

app.use(cors());

addApi(app);

app.listen(API_DEV_PORT, () => console.log(`Dev api server is listening on port ${API_DEV_PORT}`));
