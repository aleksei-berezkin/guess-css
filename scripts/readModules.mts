import path from 'path';
import fs from 'fs';
import { DepFullData } from './depFullData.mts';

type PackageInfo = {
    name: string,
    packageJsonPath: string,
    licenseFilePath: string | undefined,
}

export async function readModules(): Promise<DepFullData[]> {
    const localPackageJson = JSON.parse(String(
        await fs.promises.readFile(path.resolve(import.meta.dirname, '../package.json'))
    ))
    const fullDataPromises =  [
        ...Object.entries(localPackageJson.dependencies),
        ...Object.entries(localPackageJson.devDependencies)
    ]
        .map(([name]) => {
            const packageDir = path.resolve(import.meta.dirname, '..', 'node_modules', name)
            const packageJsonPath = path.resolve(packageDir, 'package.json')
            const licenseFilePath = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license.md']
                .map(l => path.resolve(packageDir, l))
                .filter(p => fs.existsSync(p))
                .map(p => fs.realpathSync(p))[0]
            return {
                name,
                packageJsonPath,
                licenseFilePath,
            } satisfies PackageInfo
        })
        .map(async packageInfo => {
            const packageJson = JSON.parse(String(await fs.promises.readFile(packageInfo.packageJsonPath)))
            const licenseFileText = packageInfo.licenseFilePath && String(await fs.promises.readFile(packageInfo.licenseFilePath))
            return {
                name: packageInfo.name,
                description: getDescription(packageJson, packageInfo),
                link: getLink(packageJson),
                licenseText: getLicenseText(licenseFileText, packageJson),
            } satisfies DepFullData
        })
    return await Promise.all(fullDataPromises)
}

function getDescription(packageJson: any, packageInfo: PackageInfo) {
    if (typeof packageJson.description === 'string')
        return packageJson.description as string

    return packageInfo.name
}

function getLink(packageJson: any): string {
    const linkStr =
        typeof packageJson.homepage === 'string' ? packageJson.homepage as string
            : typeof packageJson.repository === 'string' ? packageJson.repository as string
            : typeof packageJson.repository?.url === 'string' ? packageJson.repository.url as string
            : undefined

    if (!linkStr)
        throw new Error('No homepage or repository: ' + JSON.stringify(packageJson, null, 2))

    if (linkStr.startsWith('https://'))
        return linkStr

    if (linkStr.startsWith('git+'))
        return linkStr.replace('git+', '')

    if (linkStr.startsWith('github:'))
        return linkStr.replace(/^github:/, 'https://github.com/')

    console.warn('Unknown link format: ' + linkStr + ', defaulting to github')
    return 'https://github.com/' + linkStr
}

function getLicenseText(licenseFileText: string | undefined, packageJson: any) {
    if (licenseFileText)
        return licenseFileText
    if (packageJson.license)
        return 'License: ' + packageJson.license

    throw new Error('Not found license of ' + JSON.stringify(packageJson, null, 2))
}
