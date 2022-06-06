import { PersistentState } from './State';

const key = 'guess-css-persistent';

export function writeToLocalStorage(persistent: PersistentState) {
    localStorage.setItem(key, JSON.stringify(persistent));
}

export function readFromLocalStorage(version: number): PersistentState | undefined {
    const persistentStr = localStorage.getItem(key);
    if (persistentStr == null) {
        return undefined;
    }

    try {
        const persistent = JSON.parse(persistentStr);
        if (typeof persistent !== 'object' || persistent['_version'] !== version) {
            console.error('Cannot restore');
            cleanLocalStorage();
        }

        return persistent as PersistentState;
    } catch (e) {
        console.error(e);
        cleanLocalStorage();
    }
}

function cleanLocalStorage() {
    localStorage.removeItem(key);
}
