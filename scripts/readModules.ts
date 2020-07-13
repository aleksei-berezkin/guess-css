import { entryStream, stream, Stream } from '../src/client/stream/stream';
import * as localPackageJson from '../package.json';
import path from 'path';
import fs from 'fs';
import { DepFullData } from './depFullData';

type PackageJsonFile = {
    type: 'package.json',
    name: string,
    path: string,
}

type LicenseFile = {
    type: 'LICENSE',
    name: string,
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
    entryStream<{[k in DepName]?: string}>(localPackageJson.dependencies)
        .appendAll(entryStream(localPackageJson.devDependencies))
        .map(([name, _]) => [name, path.resolve(__dirname, '..', 'node_modules', name)])
        .flatMap<PackageJsonFile | LicenseFile>(([name, dir]) => [
            {
                type: 'package.json',
                name,
                path: path.resolve(dir, 'package.json'),
            },
            ...['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license.md']
                .map(filename => ({
                    type: 'LICENSE' as const,
                    name,
                    path: path.resolve(dir, filename)
                }))
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
                    const realPath = await fs.promises.realpath(file.path);
                    // Workaround register-insensitive systems
                    if (path.basename(realPath) === path.basename(file.path)) {
                        const buf = await fs.promises.readFile(realPath);
                        resolve({
                            ...file,
                            text: String(buf),
                        })
                    } else {
                        resolve(null);
                    }
                } catch (_) {
                    resolve(null);
                }
            })
        );

export const readModules: Promise<Stream<DepFullData>> = Promise.all(dataPromises)
    .then(datas =>
        stream(datas)
            .filterAndMap((data): data is PackageJsonData | LicenseData => !!data)
            .groupBy(data => data.name)
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
                name: p.name,
                description: p.description,
                homepage: p.homepage,
                license: p.license,
                licenseText: l.text,
            }))
    );
