import fs from 'fs';
import path from 'path';
import { routes } from '../app/routes';

const distPath = path.join(__dirname, '..', 'dist');
const indexHtmlStr = fs.readFileSync(path.join(distPath, 'index.html'));
for (const p in routes) {
    if (p !== routes.root) {
        const dest = path.join(distPath, `${p}.html`);
        fs.writeFileSync(dest, indexHtmlStr);
    }
}
