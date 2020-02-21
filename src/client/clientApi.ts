// Injected by Webpack DefinePlugin
// @ts-ignore
const apiBase = global.API_BASE_URL;

export function fetchGenPuzzler(): Promise<Response> {
    return fetch(apiBase + '/genPuzzler', {method: 'post'});
}

export function getPuzzlerUrl(id: string, choice: number, token: string): string {
   return `${ apiBase }/puzzler?id=${ id }&choice=${ choice }&token=${ token }`;
}

export function fetchChoice(id: string, choice: number, token: string): Promise<Response> {
    return fetch(`${ apiBase }/choiceFormatted?id=${ id }&choice=${ choice }&token=${ token }`);
}
