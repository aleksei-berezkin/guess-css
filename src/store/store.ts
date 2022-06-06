import { useEffect, useState } from 'react';
import { Topic } from '../model/topic';
import { PersistentState, PuzzlerView, State } from './State';

export class Store implements State {
    persistent: PersistentState = {
        topics: [],
        puzzlerViews: [],
        correctAnswers: 0,
        _version: 0,
    };
    current = -1;
    showProgressDialog = false;
    layoutConstants: State['layoutConstants'] = {
        footerBtnHeight: undefined,
    }

    @action()
    reset(topics: Topic[]) {
        this.persistent = {
            topics,
            puzzlerViews: [],
            correctAnswers: 0,
            _version: this.persistent._version,
        }
    }

    @action()
    restore(persistent: PersistentState) {
        this.persistent = persistent;
        this.current = persistent.puzzlerViews.length - 1;
    }

    @action()
    appendAndDisplayPuzzler(puzzlerView: PuzzlerView) {
        const newCount = this.persistent.puzzlerViews.push(puzzlerView);
        this.current = newCount - 1;
    }

    @action()
    setCurrentTab(tab: number) {
        this.persistent.puzzlerViews[this.current].currentTab = tab;
    }

    @action()
    setUserChoice(userChoice: number) {
        this.persistent.puzzlerViews[this.current].status = {
            ...this.persistent.puzzlerViews[this.current].status,
            userChoice,
        }
    }

    @action()
    displayNextPuzzler() {
        this.current++;
    }

    @action()
    displayPrevPuzzler() {
        this.current--;
    }

    @action()
    displayPuzzler(index: number) {
        this.current = index;
    }

    @action()
    displayProgressDialog(display: boolean) {
        this.showProgressDialog = display;
    }

    @action()
    incCorrectAnswers() {
        this.persistent.correctAnswers++;
    }

    @action()
    setFooterBtnHeight(footerBtnHeight: number) {
        this.layoutConstants.footerBtnHeight = footerBtnHeight;
    }
}

export const store = new Store();

const listeners: Set<(st: State) => void> = new Set();
let updateQueued = false;

function action(): MethodDecorator {
    return function(targetProto, methodName, descriptor: TypedPropertyDescriptor<any>) {
        const origMethod = descriptor.value;

        descriptor.value = function(this: State, ...args: any[]) {
            const returnValue = origMethod.apply(this, args);
            if (!updateQueued) {
                queueMicrotask(() => {
                    updateQueued = false;
                    listeners.forEach(l => l(this));
                });
                updateQueued = true;
            }
            return returnValue;
        }
    }
}

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
