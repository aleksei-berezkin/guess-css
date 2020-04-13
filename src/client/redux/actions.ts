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

type TypeOfAction<A> = A extends Action<infer T> ? (T extends Type ? T : never) : never;

export function isOfType<A extends Action>(type: TypeOfAction<A>, action: Action): action is A {
    return action.type === type;
}

export interface LoadNextPuzzler extends Action<Type.LOAD_NEXT_PUZZLER> {
    type: Type.LOAD_NEXT_PUZZLER,
    diffHint: boolean,
}

export interface DisplayPuzzler extends Action<Type.DISPLAY_PUZZLER> {
    puzzlerId: string,
    token: string,
    choiceCodes: ChoiceCode[],
}

export interface CheckChoice extends Action<Type.CHECK_CHOICE> {
    puzzlerId: string,
    token: string,
    choice: number,
}

export interface DisplayAnswer extends Action<Type.DISPLAY_ANSWER> {
    puzzlerId: string,
    userChoice: number,
    correctChoice: number,
}

export interface NavNextPuzzler extends Action<Type.NAV_NEXT_PUZZLER> {
}

export interface NavPrevPuzzler extends Action<Type.NAV_PREV_PUZZLER> {
}
