import path from 'path';
import fs from 'fs';
import { DepFullData } from './depFullData';
import { stream } from 'fluent-streams';

export const readNode = readLicense('node', 'JavaScript runtime built on Chrome\'s V8 JavaScript engine', process.argv0, 'https://nodejs.org/', '');
export const readNpm = which('npm')
    .then(ex => readLicense('npm', 'Package manager for Node.js', ex, 'https://www.npmjs.com/', 'Artistic License 2.0'));

function readLicense(name: string, description: string, executable: string, link: string, license: string): Promise<DepFullData> {
    return new Promise(resolve => {
        function _readLicense(dir: string) {
            fs.promises.readFile(path.resolve(dir, 'LICENSE'))
                .then(buf => resolve({
                    name,
                    description,
                    link,
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
                fs.promises.realpath(path.resolve(dir, name))
                    .then(
                        realpath => realpath,
                        () => null
                    )
            )
    ).then(executables =>
        stream(executables)
            .filterWithAssertion((ex): ex is string => !!ex)
            .head()
            .get()
    )
}
