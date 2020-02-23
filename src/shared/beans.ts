export interface GenPuzzlerResponse {
    id: string,
    choicesCount: number,
    token: string,
}

export interface ChoiceFormatted {
    lines: Region[][];
}

export interface Region {
    kind: RegionKind,
    text: string,
    differing?: boolean,
}

export enum RegionKind {
    Default = 'default',
    Tag = 'tag',
    AttrName = 'attr-name',
    AttrValue = 'attr-value',
    Operator = 'operator',
    Selector = 'selector',
    DeclName = 'decl-name',
    DeclValue = 'decl-value',
}

export interface CheckResponse {
    id: string,
    correctChoice: number,
}
