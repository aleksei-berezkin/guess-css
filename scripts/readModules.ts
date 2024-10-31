import * as localPackageJson from '../package.json';
import path from 'path';
import fs from 'fs';
import { DepFullData } from './depFullData';
import { groupBy } from './groupBy';

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
    description?: string,
    license?: string,
    homepage?: string,
    repository?: string | {
        url?: string,
    },
}

type LicenseData = LicenseFile & {
    text: string,
}

export const readModules: Promise<DepFullData[]> = Promise.all(
    [
        ...Object.entries(localPackageJson.dependencies),
        ...Object.entries(localPackageJson.devDependencies)
    ]
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
                        repository: json.repository,
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
        )
    ).then(datas => {
        const packageJsonOrLicenseData = datas.filter(data => !!data) as (PackageJsonData | LicenseData)[];

        return groupBy(packageJsonOrLicenseData, data => data.name)
            .map(([_, data]): readonly [PackageJsonData, { licenseText: string }] => {
                if (data.length === 1 && data[0].type === 'package.json' && data[0].name === 'npm-run-parallel') {
                    // Lacks homepage and license file
                    return [
                        {
                            ...data[0],
                            homepage: 'https://www.npmjs.com/package/npm-run-parallel',
                        },
                        {
                            licenseText: `License: ${data[0].license}`
                        }
                    ];
                }
                if (data.length === 2) {
                    if (data[0].type === 'package.json' && data[1].type === 'LICENSE') {
                        return [data[0], {licenseText: data[1].text}] as const;
                    }
                    if (data[1].type === 'package.json' && data[0].type === 'LICENSE') {
                        return [data[1], {licenseText: data[0].text}] as const;
                    }
                }
                throw new Error('Bad data: ' + JSON.stringify(data));
            })
            .map(([p, l]) => ({
                name: p.name,
                description: assertNotNull(p.description),
                link: getLink(p),
                license: assertNotNull(p.license),
                licenseText: assertNotNull(l.licenseText),
            }));
        }
    );

function assertNotNull<T>(value: T | null | undefined): T {
    if (value == null)
        throw Error('value is null')
    return value
}

function getLink(p: PackageJsonData): string {
    if (typeof p.homepage === 'string') {
        return p.homepage;
    }

    if (typeof p.repository === 'string') {
        return p.repository;
    }

    if (typeof p.repository?.url === 'string') {
        return p.repository.url;
    }

    throw new Error('No homepage or repository: ' + JSON.stringify(p));
}
