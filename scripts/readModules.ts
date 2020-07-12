import { entriesStream, stream, Stream } from '../src/client/stream/stream';
import * as localPackageJson from '../package.json';
import path from 'path';
import fs from 'fs';
import { DepFullData } from './depFullData';

type PackageJsonFile = {
    type: 'package.json',
    depName: string,
    path: string,
}

type LicenseFile = {
    type: 'LICENSE',
    depName: string,
    path: string,
}

type PackageJsonData = PackageJsonFile & {
    description: string,
    license: string,
    homepage: string,
}

type LicenseData = LicenseFile & {
    text: string,
}

type DepName = keyof typeof localPackageJson.dependencies | keyof typeof localPackageJson.devDependencies;

const dataPromises: Stream<Promise<PackageJsonData | LicenseData | null>> =
    entriesStream<{[k in DepName]?: string}>(localPackageJson.dependencies)
        .appendAll(entriesStream(localPackageJson.devDependencies))
        .map(([name, _]) => [name, path.resolve(__dirname, '..', 'node_modules', name)])
        .flatMap<PackageJsonFile | LicenseFile>(([depName, dir]) => [
            {
                type: 'package.json',
                depName,
                path: path.resolve(dir, 'package.json'),
            },
            {
                type: 'LICENSE',
                depName,
                path: path.resolve(dir, 'LICENSE'),
            },
            {
                type: 'LICENSE',
                depName,
                path: path.resolve(dir, 'LICENSE.md'),
            },
            {
                type: 'LICENSE',
                depName,
                path: path.resolve(dir, 'LICENSE.txt'),
            }
        ])
        .map(file =>
            new Promise<PackageJsonData | LicenseData | null>(async resolve => {
                if (file.type === 'package.json') {
                    const buf = await fs.promises.readFile(file.path);
                    const json = JSON.parse(String(buf));
                    resolve({
                        ...file,
                        description: json.description,
                        license: json.license,
                        homepage: json.homepage,
                    });
                    return;
                }
    
                try {
                    const buf = await fs.promises.readFile(file.path);
                    resolve({
                        ...file,
                        text: String(buf),
                    })
                } catch (_) {
                    resolve(null);
                }
            })
        );

export const readModules: Promise<Stream<DepFullData>> = Promise.all(dataPromises)
    .then(datas =>
        stream(datas)
            .filterAndMap((data): data is PackageJsonData | LicenseData => !!data)
            .groupBy(data => data.depName)
            .map(([_, data]) => {
                if (data.length === 2) {
                    if (data[0].type === 'package.json' && data[1].type === 'LICENSE') {
                        return [data[0], data[1]] as const;
                    }
                    if (data[1].type === 'package.json' && data[0].type === 'LICENSE') {
                        return [data[1], data[0]] as const;
                    }
                }
                throw new Error('Bad data: ' + JSON.stringify(data));
            })
            .map(([p, l]) => ({
                depName: p.depName,
                description: p.description,
                homepage: p.homepage,
                license: p.license,
                licenseText: l.text,
            }))
    );
