import { PuzzlerSpec, Region } from '../../shared/api';

export enum Type {
    LOAD_NEXT_PUZZLER = 'LOAD_NEXT_PUZZLER',
    DISPLAY_PUZZLER = 'DISPLAY_PUZZLER',
    LOAD_CHOICE = 'LOAD_CHOICE',
    DISPLAY_CHOICE = 'DISPLAY_CHOICE',
    CHECK_CHOICE = 'CHECK_CHOICE',
    DISPLAY_ANSWER = 'DISPLAY_ANSWER',
}

export interface Action {
    type: Type,
}

export interface LoadNextPuzzler extends Action {
    type: Type.LOAD_NEXT_PUZZLER,
}

export interface DisplayPuzzler extends Action {
    type: Type.DISPLAY_PUZZLER,
    puzzler: PuzzlerSpec,
}

export interface LoadChoice extends Action {
    type: Type.LOAD_CHOICE,
    puzzlerId: string,
    choice: number,
    token: string,
}

export interface DisplayChoice extends Action {
    type: Type.DISPLAY_CHOICE,
    puzzlerId: string,
    choice: number,
    code: Region[][],
}

export interface CheckChoice extends Action {
    type: Type.CHECK_CHOICE,
    puzzlerId: string,
    token: string,
    choice: number,
}

export interface DisplayAnswer extends Action {
    type: Type.DISPLAY_ANSWER,
    puzzlerId: string,
    userChoice: number,
    correctChoice: number,
}
