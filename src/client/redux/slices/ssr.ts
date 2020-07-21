import { createSlice } from '@reduxjs/toolkit';

type Ssr = {
    wide: boolean,
} | null;

const initialState = null as Ssr;

export const ssr = createSlice({
    name: 'ssr',
    initialState,
    reducers: {
        reset: () => null,
    },
});
