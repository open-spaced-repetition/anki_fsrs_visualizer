import {
    CLAMP_PARAMETERS,
    W17_W18_Ceiling,
    defineScheduler,
    dateChrono,
} from 'ts-fsrs';
import type { Grade } from 'ts-fsrs';
import { FSRS6_DEFAULT_WEIGHTS, migrateFSRS6Parameters, FSRS6Model } from 'ts-fsrs/models/fsrs-6';
import { FSRS5_DEFAULT_WEIGHTS, migrateFSRS5Parameters, FSRS5Model } from 'ts-fsrs/models/fsrs-5';
import { FSRS4Dot5_DEFAULT_WEIGHTS, migrateFSRS4Dot5Parameters, FSRS4Dot5Model } from 'ts-fsrs/models/fsrs-4dot5';
import { Card } from './types';
import type { FsrsCalculationParams, SliderInfo } from './types';
import { parseParameters, paramsToString, calcDisplayDifficulty } from './utils';

export { FSRS6_DEFAULT_WEIGHTS, parseParameters, paramsToString };

export const initialReviews: number[][] = [
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

const clampBounds = CLAMP_PARAMETERS(W17_W18_Ceiling);

export const sliders: SliderInfo[] = sliderNames.map((name, i) => {
    const min = clampBounds[i] ? clampBounds[i][0] : 0;
    const max = clampBounds[i] ? clampBounds[i][1] : 10;
    return {
        name: `${i}. ${name}`,
        min,
        max,
        step: 0.001,
    };
});

interface Algorithm {
    id: string;
    name: string;
    defaultWeights: readonly number[];
    migrate(weights: number[]): number[];
    steps(params: FsrsCalculationParams, reviews: Grade[]): Card[];
}

function calculateSteps(
    migrate: (weights: number[]) => number[],
    model: typeof FSRS6Model | typeof FSRS5Model | typeof FSRS4Dot5Model,
    weights: number[],
    params: FsrsCalculationParams,
    reviews: Grade[]
): Card[] {
    let weights_clipped = migrate(weights);

    const definition = defineScheduler({
        model: model,
        chrono: dateChrono,
    });

    const scheduler = definition.create({
        config: {
            weights: weights_clipped,
            enableShortTerm: true,
            numRelearningSteps: 0,
        },
    });

    let card = scheduler.newCard();
    const list: Card[] = [];
    let cumulativeInterval = 0;

    for (const grade of reviews) {
        const result = scheduler.review({ card: card, grade: grade, now: card.dueAt });

        card = result.card;

        const intervalDays = scheduler.model.nextInterval(card, params.requestRetention);

        cumulativeInterval += intervalDays;

        list.push(new Card(
            card.difficulty,
            calcDisplayDifficulty(card.difficulty),
            card.stability,
            intervalDays,
            cumulativeInterval,
            grade,
            card.state
        ));
    }

    return list;
}

export const algorithms: Record<string, Algorithm> = {
    'fsrs-6': {
        id: 'fsrs-6',
        name: 'FSRS-6',
        defaultWeights: FSRS6_DEFAULT_WEIGHTS,
        migrate: migrateFSRS6Parameters,
        steps: (params, reviews) => calculateSteps(migrateFSRS6Parameters, FSRS6Model, params.weights, params, reviews),
    },
    'fsrs-5': {
        id: 'fsrs-5',
        name: 'FSRS-5',
        defaultWeights: FSRS5_DEFAULT_WEIGHTS,
        migrate: migrateFSRS5Parameters,
        steps: (params, reviews) => calculateSteps(migrateFSRS5Parameters, FSRS5Model, params.weights, params, reviews),
    },
    'fsrs-4.5': {
        id: 'fsrs-4.5',
        name: 'FSRS-4.5',
        defaultWeights: FSRS4Dot5_DEFAULT_WEIGHTS,
        migrate: migrateFSRS4Dot5Parameters,
        steps: (params, reviews) => calculateSteps(migrateFSRS4Dot5Parameters, FSRS4Dot5Model, params.weights, params, reviews),
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
