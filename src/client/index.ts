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
        const {id, choicesCount} = genPuzzlerResponse;
        const rootDiv = document.getElementById('app-root-div');
        const correctChoice = randomBounded(choicesCount);
        rootDiv.innerHTML = `<div><iframe class='puzzler-choice' src='${ getChoiceUrl(id, correctChoice) }'></iframe></div>`;
        rootDiv.innerHTML += R.pipe(
            R.range(0),
            R.map((choice: number) => getPuzzlerChoiceElement(id, choice, choice === correctChoice)),
            R.join(''),
        )(choicesCount);
    });

function getPuzzlerChoiceElement(id: string, choice: number, correct: boolean) {
    const url = `${ apiBase }/puzzlerFormatted?id=${ id }&choice=${ choice }`;
    const codeId = `code-${id}-${choice}`;
    const correctText = correct ? 'Correct!' : 'Incorrect!';
    const div = `<div id='${ codeId }' class='choice' onclick='alert("${correctText}");'></div>`;
    fetch(url)
        .then(response => response.json())
        .then(obj => {
            const regions: Region[][] = obj as Region[][];
            document.getElementById(codeId).append(...toHtmlLines(regions));
        });
    return div;
}

function getChoiceUrl(id: string, choice: number) {
    return `${ apiBase }/puzzler?id=${ id }&choice=${ choice }`;
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
