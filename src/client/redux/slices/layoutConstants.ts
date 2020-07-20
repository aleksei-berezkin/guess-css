import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LayoutConstants = {
    footerBtnHeight: number | undefined,
};

const initialState: LayoutConstants = {
    footerBtnHeight: undefined,
};

export const layoutConstants = createSlice({
    name: 'layoutConstants',
    initialState,
    reducers: {
        setFooterBtnHeight: (state, action: PayloadAction<number>) => ({...state, footerBtnHeight: action.payload}),
    }
});
