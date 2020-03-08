import { Method } from '../shared/api';

// Injected by Webpack DefinePlugin
// @ts-ignore
const apiBase = global.API_BASE_URL;

export function fetchGenPuzzler(diffHint: boolean): Promise<Response> {
    return fetch(`${ apiBase }/${ Method.GEN_PUZZLER }?diffHint=${ diffHint }`, {method: 'post'});
}

export function getPuzzlerUrl(id: string, token: string): string {
   return `${ apiBase }/${ Method.PUZZLER }?id=${ id }&token=${ token }`;
}

export function fetchCorrectChoice(id: string, token: string): Promise<Response> {
    return fetch(`${ apiBase }/${ Method.CORRECT_CHOICE }?id=${ id }&token=${ token }`);
}
