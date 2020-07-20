import { createSlice } from '@reduxjs/toolkit';

type SsrType = {
    wide: boolean,
} | null;

const initialState: SsrType = null as SsrType;

export const ssr = createSlice({
    name: 'ssr',
    initialState,
    reducers: {
        reset: () => null,
    },
});
