import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Region } from '../../model/region';
import { AssignedColorVar } from '../assignColorVar';
import index from 'react-swipeable-views';

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
        append: (state, action: PayloadAction<PuzzlerView>) => [...state, action.payload],

        setCurrentTab: (state, action: PayloadAction<{
            index: number,
            currentTab: number
        }>): void => {
            state[action.payload.index].currentTab = action.payload.currentTab;
         },

        displayAnswer: (state, action: PayloadAction<{
            index: number,
            userChoice: number,
        }>) => {
            state[action.payload.index].status.userChoice = action.payload.userChoice;
        },
    },
});
