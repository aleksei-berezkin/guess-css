export interface Region {
    kind: RegionKind,
    text: string,
    differing?: boolean,
}

export type RegionKind =
    'default'
    | 'text'
    | 'tagBracket'
    | 'tag'
    | 'attrName'
    | 'attrValue'
    | 'operator'
    | 'selector'
    | 'declName'
    | 'declValue'
    | 'comment'
    ;
