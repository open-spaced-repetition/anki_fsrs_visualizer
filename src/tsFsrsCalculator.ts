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
            request_retention: this.desiredR
        }));

        for (const review of reviews) {
            const date = fsrs_card.due
            const scheduling_cards = f.repeat(fsrs_card, date);
            fsrs_card = scheduling_cards[<Grade>review].card;

            const displayDifficulty = this.calcDisplayDifficulty(fsrs_card.difficulty);
            const interval = f.next_interval(fsrs_card.stability, 0)
            const cumulativeInterval = card.cumulativeInterval + interval;

            if (fsrs_card.state != State.Review) {
                fsrs_card.state = State.Review;
                fsrs_card.due = new Date(date.getTime() + interval * 24 * 60 * 60 * 1000);
            }

            list.push(new Card(0, fsrs_card.difficulty, displayDifficulty, fsrs_card.stability, interval, cumulativeInterval, review));
        }

        return list;
    }
}
