import { SerializedState } from '../client/redux/stateSerialization';

export const PRELOADED_STATE_ID = '__PRELOADED_STATE__';

declare global {
    interface Window {
        [PRELOADED_STATE_ID]: SerializedState;
    }
}
