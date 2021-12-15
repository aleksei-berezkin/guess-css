import { Region } from '../model/region';
import { AssignedColorVar } from './assignColorVar';
import { useEffect, useState } from 'react';
import {allTopics, Topic} from '../model/gen/topic';

export type PuzzlerView = {
    source: string,
    styleChoices: Region[][][],
    commonStyleSummary: string[],
    commonStyle: Region[][],
    vars: {
        contrastColor: string,
        colors: AssignedColorVar[],
    },
    body: Region[][],
    status: {
        correctChoice: number,
        userChoice: number | undefined,
    },
    currentTab: number,
};

export type State = {
    topics: Topic[],
    puzzlerViews: PuzzlerView[],
    current: number,
    correctAnswers: number,
    layoutConstants: {
        footerBtnHeight: number | undefined,
    },
}

export class Store implements State {
    topics: Topic[] = [];
    puzzlerViews: PuzzlerView[] = [];
    current = -1;
    correctAnswers = 0;
    layoutConstants: State['layoutConstants'] = {
        footerBtnHeight: undefined,
    }

    @action()
    reset(topics: Topic[]) {
        this.topics = topics;
        this.puzzlerViews = [];
        this.correctAnswers = 0;
    }

    @action()
    appendAndDisplayPuzzler(puzzlerView: PuzzlerView) {
        const newCount = this.puzzlerViews.push(puzzlerView);
        this.current = newCount - 1;
    }

    @action()
    setCurrentTab(tab: number) {
        this.puzzlerViews[this.current].currentTab = tab;
    }

    @action()
    setUserChoice(userChoice: number) {
        this.puzzlerViews[this.current].status = {
            ...this.puzzlerViews[this.current].status,
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
    incCorrectAnswers() {
        this.correctAnswers++;
    }

    @action()
    setFooterBtnHeight(footerBtnHeight: number) {
        this.layoutConstants.footerBtnHeight = footerBtnHeight;
    }
}

export const store = new Store();

const listeners: Set<(st: State) => void> = new Set();

function action(): MethodDecorator {
    return function(targetProto, methodName, descriptor: TypedPropertyDescriptor<any>) {
        const origMethod = descriptor.value;

        descriptor.value = function(this: State, ...args: any[]) {
            const returnValue = origMethod.apply(this, args);
            listeners.forEach(l => l(this));
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
        const currentView = state.puzzlerViews[state.current];
        return currentView && map(currentView) || deflt;
    };
}
