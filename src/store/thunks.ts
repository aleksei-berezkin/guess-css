import { genPuzzler } from '../model/gen/genPuzzler';
import { assignColorVars } from './assignColorVar';
import ReactGA from 'react-ga';
import { store } from './store';
import { routes } from '../ui/routes';
import { leadingZeros3 } from '../util/leadingZeros3';
import { writeToLocalStorage } from './myLocalStorage';

export function genAndDisplayNewPuzzler() {
    const topic = store.persistent.topics[store.persistent.puzzlerViews.length % store.persistent.topics.length];
    const round = Math.floor(store.persistent.puzzlerViews.length / store.persistent.topics.length);
    const puzzler = genPuzzler(topic, round);
    const diffHint = store.persistent.puzzlerViews.length === 0;
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

    writeToLocalStoragePostponed();

    gaNewPuzzler();
}

export function setUserChoice(userChoice: number) {
    const { current } = store;
    const { puzzlerViews } = store.persistent;
    const isCorrect = puzzlerViews[current].status.correctChoice === userChoice;
    store.setUserChoice(userChoice)
    if (isCorrect) {
        store.incCorrectAnswers();
    }
    writeToLocalStoragePostponed();
}

function writeToLocalStoragePostponed() {
    setTimeout(() => {
        writeToLocalStorage(store.persistent);
    }, 500);
}

export function gaInit() {
    ReactGA.initialize('UA-171636839-1');
    ReactGA.pageview(routes.root);
}

export function gaNewPuzzler() {
    ReactGA.event({
        category: 'NewPuzzler',
        action: `NewPuzzler_${leadingZeros3(store.current)}`,
    });
}
