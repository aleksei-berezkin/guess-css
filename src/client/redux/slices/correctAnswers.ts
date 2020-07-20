import { createSlice } from '@reduxjs/toolkit';

export const correctAnswers = createSlice({
    name: 'correctAnswers',
    initialState: 0,
    reducers: {
        inc: state => state + 1,
    },
});
