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
    return (await Promise.all(fullDataPromises)).concat({
        // The component is copypasted
        name: 'react-scroll-snapper',
        description: 'Swipeable views for React using CSS scroll snap',
        link: 'https://github.com/phaux/react-scroll-snapper',
        licenseText: 'License: ISC'
    })
}

function getDescription(packageJson: Record<string, unknown>, packageInfo: PackageInfo) {
    if (typeof packageJson.description === 'string')
        return packageJson.description as string

    if (typeof packageJson.author === 'string')
        return 'Author: ' + packageJson.author

    return packageInfo.name
}

function getLink(packageJson: Record<string, unknown>): string {
    const linkStr = (() => {
        const {homepage, repository} = packageJson

        if (typeof homepage === 'string') return homepage
        if (typeof repository === 'string') return repository
        if (repository && typeof repository === 'object') {
            const {url} = repository as Record<string, unknown>
            if (typeof url === 'string') return url
        }
    })()

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

function getLicenseText(licenseFileText: string | undefined, packageJson: Record<string, unknown>) {
    if (licenseFileText)
        return licenseFileText
    if (packageJson.license)
        return 'License: ' + packageJson.license

    throw new Error('Not found license of ' + JSON.stringify(packageJson, null, 2))
}
