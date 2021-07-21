import { genPuzzler } from '../model/gen/genPuzzler';
import { assignColorVars } from './assignColorVar';
import ReactGA from 'react-ga';
import { store } from './store';

export function genNewPuzzler(diffHint: boolean) {
    const topic = store.topics[store.puzzlerViews.length % store.topics.length]
    const puzzler = genPuzzler(topic);
    store.appendAndDisplayPuzzler({
        source: puzzler.html,
        styleChoices: puzzler.getStyleCodes(diffHint),
        commonStyleSummary: puzzler.commonStyleSummary,
        commonStyle: puzzler.commonStyleCode,
        vars: {
            contrastColor: puzzler.rules.vars.contrastColor,
            colors: assignColorVars(puzzler.rules.vars.colors),
        },
        body: puzzler.bodyCode,
        status: {
            correctChoice: puzzler.correctChoice,
            userChoice: undefined,
        },
        currentTab: 0,
    });

    gaNewPuzzler();
}

export function checkChoice(userChoice: number) {
    const {puzzlerViews, current} = store;
    const isCorrect = puzzlerViews[current].status.correctChoice === userChoice;
    store.setUserChoice(userChoice)
    if (isCorrect) {
        store.incCorrectAnswers();
    }
}

export function gaInit() {
    ReactGA.initialize('UA-171636839-1');
    ReactGA.pageview('/');
}

export function gaNewPuzzler() {
    ReactGA.event({
        category: 'NewPuzzler',
        action: String(store.current),
    });
}
