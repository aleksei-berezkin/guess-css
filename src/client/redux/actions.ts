import { Region } from '../model/region';
import { Action } from 'redux';
import { Vector } from 'prelude-ts';
import { Topic } from '../model/gen/topic';

export enum Type {
    INIT_CLIENT = 'INIT_CLIENT',
    SET_TOPICS = 'SET_TOPICS',
    GEN_NEW_PUZZLER = 'GEN_NEW_PUZZLER',
    DISPLAY_NEW_PUZZLER = 'DISPLAY_NEW_PUZZLER',
    CHECK_CHOICE = 'CHECK_CHOICE',
    DISPLAY_ANSWER = 'DISPLAY_ANSWER',
    NAV_NEXT_PUZZLER = 'NAV_NEXT_PUZZLER',
    NAV_PREV_PUZZLER = 'NAV_PREV_PUZZLER',
}

type TypeOfAction<A> = A extends Action<infer T> ? (T extends Type ? T : never) : never;

export function isOfType<A extends Action>(type: TypeOfAction<A>, action: Action): action is A {
    return action.type === type;
}

export interface InitClient extends Action<Type.INIT_CLIENT> {
}

export interface SetTopics extends Action<Type.SET_TOPICS> {
    topics: Vector<Topic>,
}

export interface GenNewPuzzler extends Action<Type.GEN_NEW_PUZZLER> {
    diffHint: boolean,
}

export interface DisplayNewPuzzler extends Action<Type.DISPLAY_NEW_PUZZLER> {
    source: string,
    choiceCodes: Vector<Vector<Region[]>>,
    correctChoice: number,
}

export interface CheckChoice extends Action<Type.CHECK_CHOICE> {
    userChoice: number,
}

export interface DisplayAnswer extends Action<Type.DISPLAY_ANSWER> {
    userChoice: number,
    isCorrect: boolean,
}

export interface NavNextPuzzler extends Action<Type.NAV_NEXT_PUZZLER> {
}

export interface NavPrevPuzzler extends Action<Type.NAV_PREV_PUZZLER> {
}
