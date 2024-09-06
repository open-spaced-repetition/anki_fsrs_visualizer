import { State, createEmptyCard, fsrs, generatorParameters, type Grade } from "ts-fsrs";
import { Card, type IFsrsCalculator } from "./IFsrsCalculator";

export class TsFsrsCalculator implements IFsrsCalculator {
    readonly w: number[];
    readonly desiredR: number;
    readonly enableShortTerm: boolean;

    public constructor(w: number[], m: number[], enable: boolean) {
        this.w = w;
        this.desiredR = m[0];
        this.enableShortTerm = enable;
    }

    calcDisplayDifficulty(d: number) {
        return (d - 1.0) / 9.0 * 100.0;
    }

    public steps(reviews: number[]): Card[] {
        let fsrs_card = createEmptyCard(new Date());

        let card = new Card(0, 0.0, 0.0, 0.0, 0.0, 0.0, 0);
        const list = [];

        const f = fsrs(generatorParameters({
            w: this.w,
            request_retention: this.desiredR,
            enable_short_term: this.enableShortTerm
        }));

        for (const review of reviews) {
            const date = fsrs_card.due
            fsrs_card = f.next(fsrs_card, date, <Grade>review, (recordItem) => {
                const { card } = recordItem;
                const interval = f.next_interval(card.stability, card.elapsed_days)
                card.due = new Date(date.getTime() + interval * 24 * 60 * 60 * 1000);
                card.scheduled_days = interval;
                return card
            });

            const displayDifficulty = this.calcDisplayDifficulty(fsrs_card.difficulty);
            const interval = fsrs_card.scheduled_days;
            const cumulativeInterval = card.cumulativeInterval + interval;

            list.push(new Card(fsrs_card.state, fsrs_card.difficulty, displayDifficulty, fsrs_card.stability, interval, cumulativeInterval, review));
        }

        return list;
    }
}
