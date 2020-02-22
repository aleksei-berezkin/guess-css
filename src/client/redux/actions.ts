import { ChoiceFormatted, GenPuzzlerResponse } from '../../shared/beans';

export enum Type {
    LOAD_NEXT_PUZZLER = 'LOAD_NEXT_PUZZLER',
    DISPLAY_LAYOUT = 'DISPLAY_LAYOUT',
    LOAD_CHOICE = 'LOAD_CHOICE',
    DISPLAY_CHOICE = 'DISPLAY_CHOICE',
}

export interface Action {
    type: Type,
}

export interface LoadNextPuzzler extends Action {
    type: Type.LOAD_NEXT_PUZZLER,
}

export interface DisplayLayout extends Action {
    type: Type.DISPLAY_LAYOUT,
    puzzler: GenPuzzlerResponse,
    correctChoice: number,
}

export interface LoadChoice extends Action {
    type: Type.LOAD_CHOICE,
    puzzler: GenPuzzlerResponse,
    choice: number,
}

export interface DisplayChoice extends Action {
    type: Type.DISPLAY_CHOICE,
    choice: number,
    code: ChoiceFormatted,
}
