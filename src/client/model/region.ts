export interface Region {
    kind: RegionKind,
    text: string,
    differing?: boolean,
    backgroundColor?: string,
    color?: string,
}

export enum RegionKind {
    Default = 'default',
    Text = 'text',
    Tag = 'tag',
    AttrName = 'attr-name',
    AttrValue = 'attr-value',
    Operator = 'operator',
    Selector = 'selector',
    DeclName = 'decl-name',
    DeclValue = 'decl-value',
    Comment = 'comment',
}
