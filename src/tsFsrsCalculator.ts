import { createEmptyCard, fsrs, generatorParameters, type FSRSState, type Grade } from "ts-fsrs";

export class TsFsrsCalculator {
    readonly w: number[];
    readonly request_retention: number;

    public constructor(w: number[], m: number[]) {
        this.w = w;
        this.request_retention = m[0];
    }

    calcDisplayDifficulty(d: number) {
        return (d - 1.0) / 9.0 * 100.0;
    }

    public steps(reviews: number[]): Card[] {
        const list = [];
        const f = fsrs(generatorParameters({
            w: this.w,
            request_retention: this.request_retention,
        }));

        let interval = 0;
        let cumulativeInterval = 0;
        let memory: FSRSState | null = null;

        for (const review of reviews) {
            memory = f.next_state(memory, interval, review as Grade);
            const displayDifficulty = this.calcDisplayDifficulty(memory.difficulty);
            interval = f.next_interval(memory.stability, interval);
            cumulativeInterval += interval;
            list.push(new Card(memory.difficulty, displayDifficulty, memory.stability, interval, cumulativeInterval, review));
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
        public grade: number
    ) { }
}
