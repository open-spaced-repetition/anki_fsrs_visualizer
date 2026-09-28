import {
    defineScheduler,
    numericChrono,
} from 'ts-fsrs';
import type { Grade } from 'ts-fsrs';
import { schedulerDesiredRetentionMiddleware, schedulerScheduledDaysMiddleware } from 'ts-fsrs/middlewares';
import { FSRS7_DEFAULT_WEIGHTS, clipFSRS7Parameters, migrateFSRS7Parameters, FSRS7Model } from 'ts-fsrs/models/fsrs-7';
import { FSRS6_DEFAULT_WEIGHTS, clipFSRS6Parameters, migrateFSRS6Parameters, FSRS6Model } from 'ts-fsrs/models/fsrs-6';
import { FSRS5_DEFAULT_WEIGHTS, clipFSRS5Parameters, migrateFSRS5Parameters, FSRS5Model } from 'ts-fsrs/models/fsrs-5';
import { FSRS4Dot5_DEFAULT_WEIGHTS, clipFSRS4Dot5Parameters, migrateFSRS4Dot5Parameters, FSRS4Dot5Model } from 'ts-fsrs/models/fsrs-4dot5';
import { Card } from './types';
import type { FsrsCalculationParams, SliderInfo } from './types';
import { parseParameters, paramsToString, calcDisplayDifficulty } from './utils';

export { FSRS6_DEFAULT_WEIGHTS, parseParameters, paramsToString };

export const initialReviews: Grade[][] = [
    [3, 3, 3, 3],
    [3, 3, 3, 2],
    [3, 3, 3, 1],
    [2, 3, 3, 3],
    [1, 3, 3, 3],
    [4, 3, 3, 1],
];

export const additionalSliders: SliderInfo[] = [
    { name: "desired retention", min: 0.8, max: 0.99, step: 0.01 },
];

export const sliderNames: readonly string[] = [
    "initial stability (Again)",
    "initial stability (Hard)",
    "initial stability (Good)",
    "initial stability (Easy)",
    "initial difficulty (Good)",
    "initial difficulty (multiplier)",
    "difficulty (multiplier)",
    "difficulty (multiplier)",
    "stability (exponent)",
    "stability (negative power)",
    "stability (exponent)",
    "fail stability (multiplier)",
    "fail stability (negative power)",
    "fail stability (power)",
    "fail stability (exponent)",
    "stability (multiplier for Hard)",
    "stability (multiplier for Easy)",
    "short-term stability (exponent)",
    "short-term stability (exponent)",
    "short-term last-stability (exponent)",
    "decay",
];

function createSliders(names: readonly string[], clamp: Algorithm['clamp'], step = 0.001): SliderInfo[] {
    const min = clamp(Array(names.length).fill(-Number.MAX_VALUE));
    const max = clamp(Array(names.length).fill(Number.MAX_VALUE));
    return names.map((name, i) => ({ name: `${i}. ${name}`, min: min[i], max: max[i], step }));
}

const fsrs7SliderNames = [
    'initial slow stability (Again)',
    'initial slow stability (Hard)',
    'initial slow stability (Good)',
    'initial slow stability (Easy)',
    'initial difficulty',
    'initial difficulty (exponent)',
    'difficulty (multiplier)',
    ...['slow', 'fast'].flatMap(trace => [
        `${trace} stability (growth exponent)`,
        `${trace} stability (negative power)`,
        `${trace} stability (recall exponent)`,
        `${trace} fail stability (multiplier)`,
        `${trace} fail stability (power)`,
        `${trace} fail stability (recall exponent)`,
        `${trace} stability (multiplier for Hard)`,
        `${trace} stability (multiplier for Easy)`,
    ]),
    'fast decay',
    'slow decay',
    'fast curve base',
    'slow curve base',
    'fast mixture (multiplier)',
    'slow mixture (multiplier)',
    'fast mixture (negative stability power)',
    'slow mixture (stability power)',
    'slow mixture (difficulty effect)',
    'slow curve (difficulty effect)',
    'fast decay (stability effect)',
];

interface Algorithm {
    id: string;
    name: string;
    defaultWeights: readonly number[];
    sliders: SliderInfo[];
    clamp(weights: readonly number[]): number[];
    scheduler(params: FsrsCalculationParams): FSRSScheduler;
}

const middlewares = [schedulerDesiredRetentionMiddleware, schedulerScheduledDaysMiddleware];
const fsrs7 = defineScheduler({ model: FSRS7Model, chrono: numericChrono }).use(...middlewares);
const fsrs6 = defineScheduler({ model: FSRS6Model, chrono: numericChrono }).use(...middlewares);
const fsrs5 = defineScheduler({ model: FSRS5Model, chrono: numericChrono }).use(...middlewares);
const fsrs4dot5 = defineScheduler({ model: FSRS4Dot5Model, chrono: numericChrono }).use(...middlewares);
type FSRS = typeof fsrs7 | typeof fsrs6 | typeof fsrs5 | typeof fsrs4dot5;
type FSRSScheduler = ReturnType<FSRS['create']>;

function withStabilityFast(card: ReturnType<FSRSScheduler['newCard']>) {
    if ('stabilityFast' in card) return card;
    return Object.assign(card, { stabilityFast: card.stability });
}

const MIN_T = 1 / 86_400; // One second in days.

export function createSteps(scheduler: FSRSScheduler) {
    return (reviews: Grade[]): Card[] => {
        let card = withStabilityFast(scheduler.newCard({ now: 0 }));
        const list: Card[] = [];
        let cumulativeInterval = 0;
        let elapsedDays = 0;

        for (const grade of reviews) {
            const result = scheduler.review({ card, grade, now: elapsedDays });

            card = withStabilityFast(result.card);

            const intervalDays = Math.max(card.scheduledDays, MIN_T);
            card.scheduledDays = intervalDays;

            cumulativeInterval += intervalDays;
            elapsedDays = intervalDays;

            list.push(new Card(
                card.difficulty,
                calcDisplayDifficulty(card.difficulty),
                card.stability,
                intervalDays,
                cumulativeInterval,
                grade,
                card.state,
                scheduler.definition.model === FSRS7Model ? card.stabilityFast : undefined,
            ));
        }

        return list;
    };
}

export const algorithms: Record<string, Algorithm> = {
    'fsrs-7': {
        id: 'fsrs-7',
        name: 'FSRS-7',
        defaultWeights: FSRS7_DEFAULT_WEIGHTS,
        clamp: clipFSRS7Parameters,
        sliders: createSliders(fsrs7SliderNames, clipFSRS7Parameters, 0.0001),
        scheduler: params => fsrs7.create({
            config: { weights: migrateFSRS7Parameters(params.weights), desiredRetention: params.requestRetention, fractionalDays: true },
        }),
    },
    'fsrs-6': {
        id: 'fsrs-6',
        name: 'FSRS-6',
        defaultWeights: FSRS6_DEFAULT_WEIGHTS,
        clamp: clipFSRS6Parameters,
        sliders: createSliders(sliderNames, clipFSRS6Parameters),
        scheduler: params => fsrs6.create({
            config: { weights: migrateFSRS6Parameters(params.weights), desiredRetention: params.requestRetention, fractionalDays: false, enableShortTerm: true, numRelearningSteps: 0 },
        }),
    },
    'fsrs-5': {
        id: 'fsrs-5',
        name: 'FSRS-5',
        defaultWeights: FSRS5_DEFAULT_WEIGHTS,
        clamp: clipFSRS5Parameters,
        sliders: createSliders(sliderNames.slice(0, FSRS5_DEFAULT_WEIGHTS.length), clipFSRS5Parameters),
        scheduler: params => fsrs5.create({
            config: { weights: migrateFSRS5Parameters(params.weights), desiredRetention: params.requestRetention, fractionalDays: false, enableShortTerm: true },
        }),
    },
    'fsrs-4.5': {
        id: 'fsrs-4.5',
        name: 'FSRS-4.5',
        defaultWeights: FSRS4Dot5_DEFAULT_WEIGHTS,
        clamp: clipFSRS4Dot5Parameters,
        sliders: createSliders(sliderNames.slice(0, FSRS4Dot5_DEFAULT_WEIGHTS.length), clipFSRS4Dot5Parameters),
        scheduler: params => fsrs4dot5.create({
            config: { weights: migrateFSRS4Dot5Parameters(params.weights), desiredRetention: params.requestRetention, fractionalDays: false },
        }),
    },
};

export const defaultAlgorithm = algorithms['fsrs-6'];

export function detectAlgorithm(algoId?: string, weightsCount?: number): Algorithm {
    if (algoId && algorithms[algoId]) {
        return algorithms[algoId];
    }
    if (typeof weightsCount === 'number' && weightsCount > 0) {
        if (defaultAlgorithm.defaultWeights.length === weightsCount) {
            return defaultAlgorithm;
        }
        const match = Object.values(algorithms).find(a => a.defaultWeights.length === weightsCount);
        if (match) return match;
    }
    return defaultAlgorithm;
}
