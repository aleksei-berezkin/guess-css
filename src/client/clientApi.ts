import { GenPuzzlerResponse } from '../shared/beans';

// Injected by Webpack DefinePlugin
// @ts-ignore
const apiBase = global.API_BASE_URL;

export function fetchGenPuzzler(): Promise<Response> {
    return fetch(apiBase + '/genPuzzler', {method: 'post'});
}

export function getPuzzlerUrl(puzzler: GenPuzzlerResponse): string {
   return `${ apiBase }/puzzler?id=${ puzzler.id }&token=${ puzzler.token }`;
}

export function fetchChoice(puzzler: GenPuzzlerResponse, choice: number): Promise<Response> {
    return fetch(`${ apiBase }/choice?id=${ puzzler.id }&choice=${ choice }&token=${ puzzler.token }`);
}

export function fetchCheck(puzzler: GenPuzzlerResponse): Promise<Response> {
    return fetch(`${ apiBase }/check?id=${ puzzler.id }&token=${ puzzler.token }`);
}