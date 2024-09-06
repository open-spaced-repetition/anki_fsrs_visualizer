export interface IFsrsCalculator {
    steps(reviews: number[]): Card[];
}

export class Card {
    state: number;
    difficulty: number;
    displayDifficulty: number;
    stability: number;
    interval: number;
    cumulativeInterval: number;
    grade: number;

    public constructor(state: number, difficulty: number, displayDifficulty: number, stability: number, interval: number, cumulativeInterval: number, grade: number) {
        this.state = state;
        this.difficulty = difficulty;
        this.displayDifficulty = displayDifficulty;
        this.stability = stability;
        this.interval = interval;
        this.cumulativeInterval = cumulativeInterval;
        this.grade = grade;
    }
}
