import { Topic } from './model/topic';
import { store } from './store/store';

export type ScorePerTopic = {correct: number, wrong: number};

export function countScorePerTopic(): [Topic, ScorePerTopic][] {
    const scoreByTopic: Map<Topic, ScorePerTopic> = new Map(
        store.persistent.topics.map(topic => [topic, {correct: 0, wrong: 0}]),
    );

    const topicAndAnswerIsCorrect: [Topic, boolean][] = store.persistent.puzzlerViews
        .map((puzzler, i) => [
            store.persistent.topics[i % store.persistent.topics.length],
            puzzler.status.correctChoice === puzzler.status.userChoice,
        ]);

    for (const [topic, correct] of topicAndAnswerIsCorrect) {
        if (correct) {
            scoreByTopic.get(topic)!.correct++;
        } else {
            scoreByTopic.get(topic)!.wrong++;
        }
    }

    return [...scoreByTopic].sort((a, b) => b[1].correct - a[1].correct);
}
