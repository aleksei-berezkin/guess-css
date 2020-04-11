import { ChoiceCode } from '../../shared/api';
import { Action } from 'redux';

export enum Type {
    LOAD_NEXT_PUZZLER = 'LOAD_NEXT_PUZZLER',
    DISPLAY_PUZZLER = 'DISPLAY_PUZZLER',
    CHECK_CHOICE = 'CHECK_CHOICE',
    DISPLAY_ANSWER = 'DISPLAY_ANSWER',
    NAV_NEXT_PUZZLER = 'NAV_NEXT_PUZZLER',
    NAV_PREV_PUZZLER = 'NAV_PREV_PUZZLER',
}

export interface LoadNextPuzzler extends Action {
    type: Type.LOAD_NEXT_PUZZLER,
    diffHint: boolean,
}

export interface DisplayPuzzler extends Action {
    type: Type.DISPLAY_PUZZLER,
    puzzlerId: string,
    token: string,
    choiceCodes: ChoiceCode[],
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

export interface NavNextPuzzler extends Action {
    type: Type.NAV_NEXT_PUZZLER,
}

export interface NavPrevPuzzler extends Action {
    type: Type.NAV_PREV_PUZZLER,
}
