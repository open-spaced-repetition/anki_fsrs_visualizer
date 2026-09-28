import type { Grade, State } from 'ts-fsrs';

export class Card {
    constructor(
        public difficulty: number,
        public displayDifficulty: number,
        public stability: number,
        public interval: number,
        public cumulativeInterval: number,
        public grade: Grade,
        public state: State,
        public stabilityFast?: number,
    ) { }
}

export interface SliderInfo {
    name: string;
    min: number;
    max: number;
    step: number;
}

export interface FsrsCalculationParams {
    weights: number[];
    requestRetention: number;
}
