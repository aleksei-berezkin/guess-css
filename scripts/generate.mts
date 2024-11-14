import fs from 'node:fs';
import path from 'node:path';
import { readModules } from './readModules.mts';
import { readNode, readNpm } from './readNodeNpm.mts';

const generatedDir = path.resolve(import.meta.dirname, '..', 'generated');

const [modules, node, npm] = await Promise.all([
    readModules(),
    readNode(),
    readNpm(),
    fs.promises.mkdir(generatedDir, { recursive: true }),
])

const depsFull = [...modules, node, npm]

const depsWithoutLicenses = depsFull
    .map(({name, description, link}) => ({
        name,
        description,
        link,
    }))
    .sort((a, b) => a.name < b.name ? -1 : a.name === b.name ? 0 : 1)

const licenses = Object.fromEntries(
    depsFull
        .map(({name, licenseText}) => [name, licenseText] as const)
)

await Promise.all([
    fs.promises.writeFile(path.resolve(generatedDir, 'deps.json'), JSON.stringify(depsWithoutLicenses, null, 2)),
    fs.promises.writeFile(path.resolve(generatedDir, 'licenses.json'), JSON.stringify(licenses, null, 2)),
]);
