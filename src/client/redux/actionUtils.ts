import { Action } from 'redux';

type PayloadCreator<Params extends any[], Payload> = Payload extends Action ? never : (...params: Params) => Payload;

const ACTION_TYPE = Symbol('Action type');

type ActionCreator<Params extends any[], Payload> = {
    (...params: Params): Action<string> & Payload,
    [ACTION_TYPE]: string,
}

const allTypes = new Set();

/**
 * @param type Unique string
 * @param payloadCreator A function creating plain object without `type`
 */
export function actionCreator<Params extends any[], Payload>(
    type: string,
    payloadCreator: PayloadCreator<Params, Payload>
):  ActionCreator<Params, Payload> {

    if (allTypes.has(type)) {
        throw new Error('Duplicate type=' + type);
    }
    allTypes.add(type);

    return Object.assign(
        (...params: Params) => ({
            type,
            ...payloadCreator(...params),
        }),
        {
            [ACTION_TYPE]: type,
        }
    );
}

type PayloadOf<AC> = AC extends ActionCreator<any[], infer Payload> ? Payload : never;

export function isAction<AC extends ActionCreator<any[], any>>(actionCreator: AC, action: Action): action is Action<string> & PayloadOf<AC> {
    return action.type === actionCreator[ACTION_TYPE];
}
