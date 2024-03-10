export class FsrsCalculator {
    readonly w: number[];

    desiredR: number = 0.92;
    decay: number = -0.5;
    factor: number = 19.0 / 81.0;

    public constructor(w: number[]) {
        this.w = w;
    }

    calcI(r: number, s: number): number {
        return s / this.factor * (Math.pow(r, 1.0 / this.decay) - 1.0);
    }

    calcS0(g: number): number {
        return this.w[g - 1];
    }

    calcD0(g: number): number {
        return this.w[4] - this.w[5] * (g - 3.0);
    }

    calcDN(d: number, g: number): number {
        let dn = d - this.w[6] * (g - 3.0);
        return this.w[7] * this.calcD0(3) + (1.0 - this.w[7]) * dn;
    }

    calcRevExp(w: number, r: number): number {
        return Math.exp(w * (1.0 - r));
    }

    calcSN(d: number, s: number, r: number, g: number): number {
        let p = 1.0;
        if (g == 2)
            p = this.w[15];
        else if (g == 4)
            p = this.w[16];
        let sinc = Math.exp(this.w[8]) * (11.0 - d) * Math.pow(s, -this.w[9]) * (this.calcRevExp(this.w[10], r) - 1.0) * p;
        return s * (1.0 + sinc);
    }

    calcSF(d: number, s: number, r: number): number {
        return this.w[11] * Math.pow(d, -this.w[12]) * (Math.pow(s + 1.0, this.w[13]) - 1.0) * this.calcRevExp(this.w[14], r);
    }

    calcRD(d: number){
        return (d - 1.0) / 9.0 * 100.0;
    }

    public step(card: Card, g: number): Card {
        if (g < 1 || g > 4)
            return card;

        if (card.new) {
            const d = this.calcD0(g);
            const rd = this.calcRD(d);
            const s = this.calcS0(g);
            const i = this.calcI(this.desiredR, s);
            const ci = card.cumulativeInterval + i;
            return new Card(false, d, rd, s, i, ci, g);
        } else if (g == 1) {
            const d = this.calcDN(card.difficulty, g);
            const rd = this.calcRD(d);
            const s = this.calcSF(card.difficulty, card.stability, this.desiredR);
            const i = this.calcI(this.desiredR, s);
            const ci = card.cumulativeInterval + i;
            return new Card(false, d, rd, s, i, ci, g);
        } else {
            const d = this.calcDN(card.difficulty, g);
            const rd = this.calcRD(d);
            const s = this.calcSN(card.difficulty, card.stability, this.desiredR, g);
            const i = this.calcI(this.desiredR, s);
            const ci = card.cumulativeInterval + i;
            return new Card(false, d, rd, s, i, ci, g);
        }
    }

    public steps(scores: number[]): Card[] {
        var card = new Card(true, 0.0, 0.0, 0.0, 0.0, 0.0, 0);
        let list = [];

        for (let score of scores) {
            card = this.step(card, score);
            list.push(card);
        }

        return list;
    }
}

export class Card {
    new: boolean;
    difficulty: number;
    realDifficulty: number;
    stability: number;
    interval: number;
    cumulativeInterval: number;
    score: number;

    public constructor(n: boolean, difficulty: number, realDifficulty: number, stability: number, interval: number, cumulativeInterval:number, score: number) {
        this.new = n;
        this.difficulty = difficulty;
        this.realDifficulty = realDifficulty;
        this.stability = stability;
        this.interval = interval;
        this.cumulativeInterval = cumulativeInterval;
        this.score = score;
    }
}
