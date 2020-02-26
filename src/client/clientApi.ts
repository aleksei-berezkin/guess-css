import { GenPuzzlerResponse, Method } from '../shared/api';

// Injected by Webpack DefinePlugin
// @ts-ignore
const apiBase = global.API_BASE_URL;

export function fetchGenPuzzler(): Promise<Response> {
    return fetch(`${ apiBase }/${ Method.GEN_PUZZLER }`, {method: 'post'});
}

export function getPuzzlerUrl(puzzler: GenPuzzlerResponse): string {
   return `${ apiBase }/${ Method.PUZZLER }?id=${ puzzler.id }&token=${ puzzler.token }`;
}

export function fetchChoice(puzzler: GenPuzzlerResponse, choice: number): Promise<Response> {
    return fetch(`${ apiBase }/${ Method.CHOICE }?id=${ puzzler.id }&choice=${ choice }&token=${ puzzler.token }`);
}

export function fetchCorrectChoice(puzzler: GenPuzzlerResponse): Promise<Response> {
    return fetch(`${ apiBase }/${ Method.CORRECT_CHOICE }?id=${ puzzler.id }&token=${ puzzler.token }`);
}
