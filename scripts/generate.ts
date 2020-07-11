import fs from 'fs';
import path from 'path';
import { readModules } from './readModules';
import { readNode, readNpm } from './readNodeNpm';

const generatedDir = path.resolve(__dirname, '..', 'generated');

Promise.all([readModules, readNode, readNpm, fs.promises.mkdir(generatedDir, { recursive: true })])
    .then(([modules, node, npm]) => {
            const deps = modules.append(node).append(npm)
                .sortOn(({depName}) => depName)
                .toArray();
            fs.writeFileSync(
                path.resolve(generatedDir, 'deps.json'),
                JSON.stringify(deps),
            );
        }
    );
