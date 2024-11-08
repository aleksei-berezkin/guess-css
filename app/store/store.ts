import { useEffect, useState } from 'react';
import { allTopics, Topic } from '../model/topic';
import { PersistentState, PuzzlerView, State } from './State';

export class Store implements State {
    persistent: PersistentState = {
        _version: 1,
        topics: allTopics,
        puzzlerViews: [],
        correctAnswers: 0,
    };
    current = -1;
    showProgressDialog = false;
    layoutConstants: State['layoutConstants'] = {
        footerBtnHeight: undefined,
    }

    reset(topics: Topic[]) {
        this.persistent = {
            topics,
            puzzlerViews: [],
            correctAnswers: 0,
            _version: this.persistent._version,
        }
        this.#notifyListeners()
    }

    restoreAndDisplayLast(persistent: PersistentState) {
        this.persistent = persistent;
        this.current = persistent.puzzlerViews.length - 1;
        this.showProgressDialog = false;
        this.#notifyListeners()
    }

    appendAndDisplayPuzzler(puzzlerView: PuzzlerView) {
        const newCount = this.persistent.puzzlerViews.push(puzzlerView);
        this.current = newCount - 1;
        this.showProgressDialog = false;
        this.#notifyListeners()
    }

    setCurrentTab(tab: number) {
        this.persistent.puzzlerViews[this.current].currentTab = tab;
        this.#notifyListeners()
    }

    setUserChoice(userChoice: number) {
        this.persistent.puzzlerViews[this.current].status = {
            ...this.persistent.puzzlerViews[this.current].status,
            userChoice,
        }
        this.#notifyListeners()
    }

    displayNextPuzzler() {
        this.current++;
        this.#notifyListeners()
    }

    displayPrevPuzzler() {
        this.current--;
        this.#notifyListeners()
    }

    displayPuzzler(index: number) {
        this.current = index;
        this.#notifyListeners()
    }

    displayProgressDialog() {
        this.showProgressDialog = true;
        this.#notifyListeners()
    }

    incCorrectAnswers() {
        this.persistent.correctAnswers++;
        this.#notifyListeners()
    }

    setFooterBtnHeight(footerBtnHeight: number) {
        this.layoutConstants.footerBtnHeight = footerBtnHeight;
        this.#notifyListeners()
    }

    #notifyQueued = false;
    #notifyListeners() {
        if (!this.#notifyQueued) {
            queueMicrotask(() => {
                this.#notifyQueued = false;
                listeners.forEach(l => l(this));
            });
            this.#notifyQueued = true;
        }
    }
}

export const store = new Store();

const listeners: Set<(st: State) => void> = new Set();


export function useSelector<T>(
    selector: (st: State) => T,
): T {
    const [state, setState] = useState(selector(store));

    useEffect(() => {
        const l = () => setState(selector(store));
        listeners.add(l);
        return () => void listeners.delete(l);
    }, []);

    return state;
}

export function ofCurrentView<K extends keyof PuzzlerView>(key: K, deflt: PuzzlerView[K]): (state: State) => PuzzlerView[K] {
    return mapCurrentView(v => v && v[key], deflt);
}
export function ofCurrentViewOrUndefined<K extends keyof PuzzlerView>(key: K): (state: State) => (PuzzlerView[K] | undefined) {
    return mapCurrentView(v => v && v[key], undefined);
}

export function mapCurrentView<T>(map: (v: PuzzlerView) => T, deflt: T): (state: State) => T {
    return state => {
        const currentView = state.persistent.puzzlerViews[state.current];
        return currentView && map(currentView) || deflt;
    };
}
