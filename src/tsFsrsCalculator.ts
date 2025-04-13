import { createEmptyCard, fsrs, generatorParameters, type Grade } from "ts-fsrs";

export class TsFsrsCalculator {
    readonly w: number[];
    readonly request_retention: number;
    readonly enable_short_term: boolean;

    public constructor(w: number[], m: number[], enable_short_term: boolean) {
        this.w = w;
        this.request_retention = m[0];
        this.enable_short_term = enable_short_term;
    }

    calcDisplayDifficulty(d: number) {
        return (d - 1.0) / 9.0 * 100.0;
    }

    calcDailyLoad(interval: number) {
        return Math.round(1 / (interval ?? 1) * 10000.0) / 100.00;
    }

    public steps(reviews: number[]): Card[] {
        let fsrs_card = createEmptyCard(new Date());
        const list = [];
        let cumulativeInterval = 0;
        const f = fsrs(generatorParameters({
            w: this.w,
            request_retention: this.request_retention,
            enable_short_term: this.enable_short_term
        }));

        for (const review of reviews) {
            const date = fsrs_card.due;
            fsrs_card = f.next(fsrs_card, date, review as Grade, (recordItem) => {
                const card = recordItem.card;
                const interval = f.next_interval(card.stability, card.elapsed_days);
                card.due = new Date(date.getTime() + interval * 24 * 60 * 60 * 1000);
                card.scheduled_days = interval;
                return card;
            });

            const displayDifficulty = this.calcDisplayDifficulty(fsrs_card.difficulty);
            const interval = fsrs_card.scheduled_days;
            const dailyLoad = this.calcDailyLoad(interval)
            cumulativeInterval += interval;
            list.push(new Card(fsrs_card.state, fsrs_card.difficulty, displayDifficulty, fsrs_card.stability, interval, dailyLoad, cumulativeInterval, review));
        }

        return list;
    }
}

export class Card {
    state: number;
    difficulty: number;
    displayDifficulty: number;
    stability: number;
    interval: number;
    dailyLoad: number;
    cumulativeInterval: number;
    grade: number;

    public constructor(state: number, difficulty: number, displayDifficulty: number, stability: number, interval: number, dailyLoad: number, cumulativeInterval: number, grade: number) {
        this.state = state;
        this.difficulty = difficulty;
        this.displayDifficulty = displayDifficulty;
        this.stability = stability;
        this.interval = interval;
        this.dailyLoad = dailyLoad;
        this.cumulativeInterval = cumulativeInterval;
        this.grade = grade;
    }
}
