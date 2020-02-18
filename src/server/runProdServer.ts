import express from 'express';
import path from 'path';
import addApi from './api';

if (process.env.NODE_ENV !== 'production') {
    throw new Error(process.env.NODE_ENV);
}

const port = process.argv[process.argv.length - 1];
const app = express();

app.use(express.static(path.resolve(__dirname, '..', '..', 'dist')));

addApi(app);

app.listen(port, () => console.log(`Prod server is listening on port ${port}`));
