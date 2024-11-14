import fs from 'fs';
import path from 'node:path';
import { routes } from '../src/routes';

const distPath = path.join(import.meta.dirname, '..', 'dist');
const indexHtmlStr = fs.readFileSync(path.join(distPath, 'index.html'));
for (const p in routes) {
    if (p !== routes.root) {
        const dest = path.join(distPath, `${p}.html`);
        fs.writeFileSync(dest, indexHtmlStr);
    }
}
