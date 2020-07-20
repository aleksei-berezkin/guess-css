import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Topic } from '../../model/gen/topic';

export const topics = createSlice({
    name: 'topics',
    initialState: [] as Topic[],
    reducers: {
        set: (state, action: PayloadAction<Topic[]>) => action.payload,
    },
});
