import fs from 'node:fs';
import path from 'node:path';
import { readModules } from './readModules.mts';
import { readNode, readNpm } from './readNodeNpm.mts';

const generatedDir = path.resolve(import.meta.dirname, '..', 'generated');

Promise.all([readModules, readNode, readNpm, fs.promises.mkdir(generatedDir, { recursive: true })])
    .then(([modules, node, npm]) => {
            const depsFull = [...modules, node, npm];
            const deps = depsFull
                .map(({name, description, link}) => ({
                    name,
                    description,
                    link,
                }))
                .sort((a, b) => a.name < b.name ? -1 : a.name === b.name ? 0 : 1);
            const licenses = Object.fromEntries(
                depsFull
                    .map(({name, licenseText}) => [name, licenseText] as const)
            );
            return Promise.all([
                fs.promises.writeFile(path.resolve(generatedDir, 'deps.json'), JSON.stringify(deps)),
                fs.promises.writeFile(path.resolve(generatedDir, 'licenses.json'), JSON.stringify(licenses)),
            ]);
        }
    );

