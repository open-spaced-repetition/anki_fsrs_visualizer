export class FsrsCalculator {
    readonly w: number[];
    readonly desiredR: number;
    readonly decay: number;
    readonly factor: number;

    public constructor(w: number[], m: number[]) {
        this.w = w;
        this.desiredR = m[0];
        this.decay = m[1];
        this.factor = m[2];
    }

    calcInterval(r: number, s: number): number {
        return (s / this.factor) * (Math.pow(r, 1.0 / this.decay) - 1.0);
    }

    calcStabilityStart(g: number): number {
        return this.w[g - 1];
    }

    calcDifficultyStart(g: number): number {
        const d = this.w[4] - this.w[5] * (g - 3.0);
        return this.clamp(d, 1, 10);
    }

    calcDifficultyNormal(d: number, g: number): number {
        const dn = d - this.w[6] * (g - 3.0);
        const dn2 = this.w[7] * this.calcDifficultyStart(3) + (1.0 - this.w[7]) * dn;
        return this.clamp(dn2, 1, 10);
    }

    calcRevExp(w: number, r: number): number {
        return Math.exp(w * (1.0 - r));
    }

    calcStabilityNormal(d: number, s: number, r: number, g: number): number {
        let p = 1.0;
        if (g == 2)
            p = this.w[15];
        else if (g == 4)
            p = this.w[16];
        const sinc = Math.exp(this.w[8]) * (11.0 - d) * Math.pow(s, -this.w[9]) * (this.calcRevExp(this.w[10], r) - 1.0) * p;
        return s * (1.0 + sinc);
    }

    calcStabilityFailed(d: number, s: number, r: number): number {
        return this.w[11] * Math.pow(d, -this.w[12]) * (Math.pow(s + 1.0, this.w[13]) - 1.0) * this.calcRevExp(this.w[14], r);
    }

    calcDisplayDifficulty(d: number) {
        return (d - 1.0) / 9.0 * 100.0;
    }

    clamp(number: number, min: number, max: number) {
        return Math.max(min, Math.min(number, max));
    }

    public step(card: Card, g: number): Card {
        if (g < 1 || g > 4)
            return card;

        const difficulty = this.calcNextDifficulty(card, g);
        const stability = this.calcNextStability(card, g);
        const displayDifficulty = this.calcDisplayDifficulty(difficulty);
        const interval = this.calcInterval(this.desiredR, stability);
        const cumulativeInterval = card.cumulativeInterval + interval;

        return new Card(false, difficulty, displayDifficulty, stability, interval, cumulativeInterval, g);
    }

    private calcNextDifficulty(card: Card, g: number): number {
        if (card.new) {
            return this.calcDifficultyStart(g);
        } else {
            return this.calcDifficultyNormal(card.difficulty, g);
        }
    }

    private calcNextStability(card: Card, g: number): number {
        if (card.new) {
            return this.calcStabilityStart(g);
        } else if (g == 1) {
            return this.calcStabilityFailed(card.difficulty, card.stability, this.desiredR);
        } else {
            return this.calcStabilityNormal(card.difficulty, card.stability, this.desiredR, g);
        }
    }

    public steps(scores: number[]): Card[] {
        let card = new Card(true, 0.0, 0.0, 0.0, 0.0, 0.0, 0);
        const list = [];

        for (const score of scores) {
            card = this.step(card, score);
            list.push(card);
        }

        return list;
    }
}

export class Card {
    new: boolean;
    difficulty: number;
    displayDifficulty: number;
    stability: number;
    interval: number;
    cumulativeInterval: number;
    score: number;

    public constructor(n: boolean, difficulty: number, displayDifficulty: number, stability: number, interval: number, cumulativeInterval: number, score: number) {
        this.new = n;
        this.difficulty = difficulty;
        this.displayDifficulty = displayDifficulty;
        this.stability = stability;
        this.interval = interval;
        this.cumulativeInterval = cumulativeInterval;
        this.score = score;
    }
}
