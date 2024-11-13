export type Region = [
    text: string,
    kind: RegionKindLabel,
    differing?: boolean,
]

export const regionKind = {
    default: 'd' as const,
    text: 't' as const,
    tagBracket: 'b' as const,
    tag: 'a' as const,
    attrName: 'n' as const,
    attrValue: 'v' as const,
    operator: 'o' as const,
    selector: 's' as const,
    declarationName: 'N' as const,
    declarationValue: 'V' as const,
    comment: 'c' as const,
}

export type RegionKindLabel = typeof regionKind[keyof typeof regionKind]

const labelsSet = new Set(Object.entries(regionKind).map(([, v]) => v))
if (labelsSet.size !== Object.keys(regionKind).length) {
    throw new Error('Not unique labels');
}