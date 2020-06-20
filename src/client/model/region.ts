export interface Region {
    kind: RegionKind,
    text: string,
    differing?: boolean,
    backgroundColor?: string,
    color?: string,
}

export type RegionKind =
    'default'
    | 'text'
    | 'tag'
    | 'attrName'
    | 'attrValue'
    | 'operator'
    | 'selector'
    | 'declName'
    | 'declValue'
    | 'comment'
    ;
