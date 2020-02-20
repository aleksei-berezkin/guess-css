import './styles.css';
import { GenPuzzlerResponse, Region } from '../shared/beans';
import * as R from 'ramda';
import { randomBounded } from '../shared/util';

console.log('Hi there');


// Injected by Webpack DefinePlugin
// @ts-ignore
const apiBase = global.API_BASE_URL;


fetch(apiBase + '/genPuzzler', {method: 'post'})
    .then(response => response.json())
    .then((genPuzzlerResponse: GenPuzzlerResponse) => {
        const {id, choicesCount, token} = genPuzzlerResponse;
        const rootDiv = document.getElementById('app-root-div');
        const correctChoice = randomBounded(choicesCount);
        rootDiv!.innerHTML = `<div><iframe class='puzzler-choice' src='${ getChoiceSrcUrl(id, correctChoice, token) }'></iframe></div>`;
        rootDiv!.innerHTML += R.pipe(
            R.range(0),
            R.map((choice: number) => getPuzzlerChoiceElement(id, choice, token, choice === correctChoice)),
            R.join(''),
        )(choicesCount);
    });

function getPuzzlerChoiceElement(id: string, choice: number, token: string, correct: boolean) {
    const url = getChoiceFormattedUrl(id, choice, token);
    const codeId = `code-${id}-${choice}`;
    const correctText = correct ? 'Correct!' : 'Incorrect!';
    const div = `<div id='${ codeId }' class='choice' onclick='alert("${correctText}");'></div>`;
    fetch(url)
        .then(response => response.json())
        .then((regions: Region[][]) => document.getElementById(codeId)!.append(...toHtmlLines(regions)));
    return div;
}

function getChoiceSrcUrl(id: string, choice: number, token: string) {
    return getChoiceUrl('puzzler', id, choice, token);
}

function getChoiceFormattedUrl(id: string, choice: number, token: string) {
    return getChoiceUrl('puzzlerFormatted', id, choice, token);
}

function getChoiceUrl(path: string, id: string, choice: number, token: string) {
    return `${ apiBase }/${ path }?id=${ id }&choice=${ choice }&token=${ token }`;
}

function toHtmlLines(regions: Region[][]): HTMLElement[] {
    return R.pipe(
        R.map((regions: Region[]): HTMLElement => {
            const pre = document.createElement('pre');
            pre.append(...toHtmlLineRegions(regions));
            return pre;
        })
    )(regions);
}

function toHtmlLineRegions(regions: Region[]): HTMLElement[] {
    return R.map(
        (region: Region) => {
            const span = document.createElement('span');
            if (region.differing) {
                span.className = 'differing ' + region.kind;
            } else {
                span.className = region.kind;
            }
            span.innerText = region.text;
            return span;
        }
    )(regions);
}
