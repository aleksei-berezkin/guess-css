import { continually, stream } from '../../stream/stream';

export enum Topic {
    DISPLAY = 'DISPLAY',
    FLEXBOX = 'FLEXBOX',
    POSITION = 'POSITION',
    SELECTORS = 'SELECTORS',
}

const TOPIC_KEYS = Object.keys(Topic) as Topic[];

export function getRandomizedTopics(): Topic[] {
    return continually(() => stream(TOPIC_KEYS).shuffle())
        .take(5)
        .flatMap(v => v)
        .toArray();
}
