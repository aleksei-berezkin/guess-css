import path from 'path';
import fs from 'fs';
import { DepFullData } from './depFullData.mts';

export async function readNode() {
    const nodeExecutable = await fs.promises.realpath(process.execPath)
    return {
        name: 'node',
        description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
        link: 'https://nodejs.org/',
        licenseText: await readLicense(nodeExecutable),
    }
}

export async function readNpm(): Promise<DepFullData> {
    const npmExecutable = await which('npm')
    return {
        name: 'npm',
        description: 'Package manager for Node.js',
        link: 'https://www.npmjs.com/',
        licenseText: await readLicense(npmExecutable),
    }
}

async function readLicense(executable: string): Promise<string> {
    const fileName = path.resolve(path.dirname(executable), '..', 'LICENSE')
    return String(await fs.promises.readFile(fileName))
}

async function which(name: string): Promise<string> {
    const pathItems = process.env.PATH!.split(path.delimiter)
    for (const dir of pathItems) {
        try {
            return await fs.promises.realpath(path.resolve(dir, name))
        }
        catch {
            continue
        }
    }

    throw new Error(name + ' is not found in PATH=' + process.env.PATH!)
}
