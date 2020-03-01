import { Method } from '../shared/api';

// Injected by Webpack DefinePlugin
// @ts-ignore
const apiBase = global.API_BASE_URL;

export function fetchGenPuzzler(): Promise<Response> {
    return fetch(`${ apiBase }/${ Method.GEN_PUZZLER }`, {method: 'post'});
}

export function getPuzzlerUrl(id: string, token: string): string {
   return `${ apiBase }/${ Method.PUZZLER }?id=${ id }&token=${ token }`;
}

export function fetchChoices(id: string, token: string, diffHint: boolean): Promise<Response> {
    return fetch(`${ apiBase }/${ Method.CHOICES }?id=${ id }&token=${ token }&diffHint=${ diffHint }`);
}

export function fetchCorrectChoice(id: string, token: string): Promise<Response> {
    return fetch(`${ apiBase }/${ Method.CORRECT_CHOICE }?id=${ id }&token=${ token }`);
}
