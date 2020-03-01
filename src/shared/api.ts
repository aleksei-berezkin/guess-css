export enum Method {
    GEN_PUZZLER = 'genPuzzler',
    PUZZLER = 'puzzler',
    CHOICES = 'choices',
    CORRECT_CHOICE = 'correctChoice',
}

export interface GenPuzzlerResponse {
    id: string,
    token: string,
}

type ChoiceCode = Region[][];

export type ChoiceCodes = ChoiceCode[];

export interface Region {
    kind: RegionKind,
    text: string,
    differing?: boolean,
    backgroundColor?: string,
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
    Comment = 'comment',
}

export type CorrectChoiceResponse = number;
