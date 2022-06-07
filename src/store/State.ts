import { Topic } from '../model/topic';
import { Region } from '../model/region';
import { AssignedColorVar } from './assignColorVar';

export type State = {
    persistent: PersistentState,
    current: number,
    showProgressDialog: boolean,
    layoutConstants: {
        footerBtnHeight: number | undefined,
    },
}

export type PersistentState = {
    _version: number,       // Increment on each persistent state change 
    topics: Topic[],
    puzzlerViews: PuzzlerView[],
    correctAnswers: number,
}

export type PuzzlerView = {
    source: string,                 // TODO computed
    styleChoices: Region[][][],
    commonStyleSummary: string[],   // TODO computed
    commonStyle: Region[][],
    vars: {
        contrastColor: string,
        colors: AssignedColorVar[],
    },
    body: Region[][],
    status: {
        correctChoice: number,
        userChoice: number | undefined,
    },
    currentTab: number,
};
