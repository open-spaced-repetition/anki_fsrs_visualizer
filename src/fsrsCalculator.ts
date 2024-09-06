import { Card, type IFsrsCalculator } from "./IFsrsCalculator";

export class FsrsCalculator implements IFsrsCalculator {
    readonly w: number[];
    readonly desiredR: number;
    readonly decay: number;
    readonly factor: number;
    readonly enableShortTerm: boolean;

    public constructor(w: number[], m: number[], shortTerm: boolean) {
        this.w = w;
        this.desiredR = m[0];
        this.decay = -0.5;
        this.factor = 19.0 / 81.0;
        this.enableShortTerm = shortTerm
    }

    calcInterval(r: number, s: number): number {
        return Math.max(1, Math.round((s / this.factor) * (Math.pow(r, 1.0 / this.decay) - 1.0)));
    }

    calcRetention(interval: number, s: number): number {
        return Math.pow(1 + (this.factor * interval) / s, this.decay);
    }

    calcStabilityStart(g: number): number {
        return this.w[g - 1];
    }

    calcDifficultyStart(g: number): number {
        const d = this.w[4] - Math.exp((g - 1) * this.w[5]) + 1;
        return this.clamp(d, 1, 10);
    }

    calcDifficultyNormal(d: number, g: number): number {
        const dn = d - this.w[6] * (g - 3.0);
        const dn2 = this.w[7] * this.calcDifficultyStart(4) + (1.0 - this.w[7]) * dn;
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

    calcStabilityShortTerm(s: number, g: number): number {
        return s * Math.exp(this.w[17] * (g - 3 + this.w[18]));
    }

    calcDisplayDifficulty(d: number) {
        return (d - 1.0) / 9.0 * 100.0;
    }

    calcState(state: number, grade: number, interval: number): number {
        // state : 0 =New, 1=Learning, 2=Review, 3=Relearning
        // grade : 1=Again, 2=Hard, 3=Good, 4=Easy
        if (!this.enableShortTerm) {
            return 2;
        }
        switch (state) {
            case 0:
                return grade == 4 ? 2 : 1;
            case 1:
            case 3:
                return (grade == 1 || interval < 1) ? state : 2;
            case 2:
                return grade == 1 ? 3 : 2;
        }
        return state;
    }

    clamp(number: number, min: number, max: number) {
        return Math.max(min, Math.min(number, max));
    }

    public step(card: Card, grade: number): Card {
        if (grade < 1 || grade > 4)
            return card;

        const retention = this.calcRetention(card.interval, card.stability);
        const difficulty = this.calcNextDifficulty(card, grade);
        const stability = this.calcNextStability(card, grade, retention);
        const displayDifficulty = this.calcDisplayDifficulty(difficulty);
        const interval = this.calcInterval(this.desiredR, stability);
        const cumulativeInterval = card.cumulativeInterval + interval;
        const state = this.calcState(card.state, grade, interval);

        return new Card(state, difficulty, displayDifficulty, stability, interval, cumulativeInterval, grade);
    }

    private calcNextDifficulty(card: Card, grade: number): number {
        if (card.state == 0) {
            return this.calcDifficultyStart(grade);
        } else {
            return this.calcDifficultyNormal(card.difficulty, grade);
        }
    }

    private calcNextStability(card: Card, grade: number, retention: number): number {
        if (card.state == 0) {
            return this.calcStabilityStart(grade);
        } else {
            if (card.state == 1 || card.state == 3) {
                return this.calcStabilityShortTerm(card.stability, grade);
            } else {
                if (grade == 1) {
                    return this.calcStabilityFailed(card.difficulty, card.stability, retention);
                } else {
                    return this.calcStabilityNormal(card.difficulty, card.stability, retention, grade);
                }
            }
        }
    }

    public steps(reviews: number[]): Card[] {
        let card = new Card(0, 0.0, 0.0, 0.0, 0.0, 0.0, 0);
        const list = [];

        for (const review of reviews) {
            card = this.step(card, review);
            list.push(card);
        }

        return list;
    }
}
