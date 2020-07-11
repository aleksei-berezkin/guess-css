import path from 'path';
import fs from 'fs';
import { DepFullData } from './depFullData';
import { stream } from '../src/client/stream/stream';

export const readNode = readLicense('node', process.argv0, 'https://nodejs.org/', '(Multiple, see text)');
export const readNpm = which('npm')
    .then(ex => readLicense('npm', ex, 'https://www.npmjs.com/', 'Artistic License 2.0'));

function readLicense(name: string, executable: string, homepage: string, license: string): Promise<DepFullData> {
    return new Promise(resolve => {
        function _readLicense(dir: string) {
            fs.promises.readFile(path.resolve(dir, 'LICENSE'))
                .then(buf => resolve({
                    depName: name,
                    homepage,
                    license,
                    licenseText: String(buf),
                }))
                .catch(_ => {
                    const parentDir = path.dirname(dir);
                    if (parentDir === dir) {
                        throw new Error('LICENSE not found. Started from ' + executable);
                    }
                    _readLicense(path.dirname(dir));
                });
        }
        _readLicense(path.dirname(executable));
    })
}

function which(name: string): Promise<string> {
    return Promise.all(
        stream(process.env.PATH!.split(path.delimiter))
            .map(dir =>
                new Promise<string | null>(resolve =>
                    fs.promises.realpath(path.resolve(dir, name))
                        .then(
                            resolve,
                            () => resolve(null)
                        )
                )
            )
    ).then(executables =>
        stream(executables)
            .filterAndMap((ex): ex is string => !!ex)
            .single()
            .orElseThrow()
    )
}
