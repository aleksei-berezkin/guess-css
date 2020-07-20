import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const current = createSlice({
    name: 'current',
    initialState: -1,
    reducers: {
        prev: state => state - 1,
        to: (state, action: PayloadAction<number>) => action.payload,
        next: state => state + 1,
    },
});
