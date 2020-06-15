export const withPayload = <T>() => (payload: T) => ({ payload });
export const noPayload = () => ({} as { payload: never });
