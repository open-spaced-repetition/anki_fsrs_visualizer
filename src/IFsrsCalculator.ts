export interface IFsrsCalculator {
    steps(reviews: number[]): Card[];
}

export class Card {
    new: boolean;
    difficulty: number;
    displayDifficulty: number;
    stability: number;
    interval: number;
    cumulativeInterval: number;
    grade: number;

    public constructor(n: boolean, difficulty: number, displayDifficulty: number, stability: number, interval: number, cumulativeInterval: number, grade: number) {
        this.new = n;
        this.difficulty = difficulty;
        this.displayDifficulty = displayDifficulty;
        this.stability = stability;
        this.interval = interval;
        this.cumulativeInterval = cumulativeInterval;
        this.grade = grade;
    }
}
