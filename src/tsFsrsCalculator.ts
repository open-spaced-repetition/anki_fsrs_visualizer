import { createEmptyCard, fsrs, generatorParameters, type FSRSState, type Grade, type State, type Steps } from "ts-fsrs";

export class TsFsrsCalculator {
    readonly w: number[];
    readonly request_retention: number;
    readonly learning_steps: Steps;
    readonly relearning_steps: Steps;

    public constructor(w: number[], m: number[], learning_steps: Steps, relearning_steps: Steps) {
        this.w = w;
        this.request_retention = m[0];
        this.learning_steps = learning_steps;
        this.relearning_steps = relearning_steps;
    }

    calcDisplayDifficulty(d: number) {
        return (d - 1.0) / 9.0 * 100.0;
    }

    public steps(reviews: Grade[]): Card[] {
        const list = [];
        const f = fsrs(generatorParameters({
            w: this.w,
            request_retention: this.request_retention,
            enable_short_term: true,
            learning_steps: this.learning_steps,
            relearning_steps: this.relearning_steps,
            enable_fuzz: false,
        }));

        let card = createEmptyCard(new Date());
        let cumulativeInterval = 0;

        for (const review of reviews) {
            const result = f.next(card, card.due, review)

            const difficulty = result.card.difficulty;
            const displayDifficulty = this.calcDisplayDifficulty(difficulty);
            const interval = result.card.scheduled_days;

            cumulativeInterval += interval;

            list.push(new Card(difficulty, displayDifficulty, result.card.stability, interval, cumulativeInterval, review, result.card.state));

            card = result.card;
        }

        return list;
    }
}

export class Card {
    constructor(
        public difficulty: number,
        public displayDifficulty: number,
        public stability: number,
        public interval: number,
        public cumulativeInterval: number,
        public grade: Grade,
        public state: State,
    ) { }
}
