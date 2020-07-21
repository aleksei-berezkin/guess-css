import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Region } from '../../model/region';
import { AssignedColorVar } from '../assignColorVar';

export type PuzzlerView = {
    source: string,
    styleChoices: Region[][][],
    commonStyleSummary: string[],
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

export const puzzlerViews = createSlice({
    name: 'puzzlerViews',
    initialState: [] as PuzzlerView[],
    reducers: {
        append: (state, {payload}: PayloadAction<PuzzlerView>) => { state.push(payload) },

        setCurrentTab: (state, {payload}: PayloadAction<{
            index: number,
            currentTab: number
        }>): void => {
            state[payload.index].currentTab = payload.currentTab;
        },

        displayAnswer: (state, {payload}: PayloadAction<{
            index: number,
            userChoice: number,
        }>) => {
            state[payload.index].status.userChoice = payload.userChoice;
        },
    },
});
