import { default_w, CLAMP_PARAMETERS, W17_W18_Ceiling, FSRS5_DEFAULT_DECAY } from "ts-fsrs";

export { default_w };

export interface SliderInfo {
    name: string;
    min: number;
    max: number;
    step: number;
}

export type FsrsVersion = '5' | '6';

// Last FSRS-5-only release of ts-fsrs (4.7.1) default_w, before FSRS-6 added w19/w20.
const default_w_v5: readonly number[] = [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046,
    1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315,
    2.9898, 0.51655, 0.6621,
];

// FSRS-5 has no w19/w20; these are the values ts-fsrs's own migrateParameters()
// fills in when upgrading a 19-length (FSRS-5) parameter set to 21 (FSRS-6).
export const fsrs6OnlyIndices = [19, 20];

export function defaultWeightsFor(version: FsrsVersion): number[] {
    return version === '5' ? [...default_w_v5, 0, FSRS5_DEFAULT_DECAY] : [...default_w];
}

export const initial_reviews: number[][] = [
    [3, 3, 3, 3],
    [3, 3, 3, 2],
    [3, 3, 3, 1],
    [2, 3, 3, 3],
    [1, 3, 3, 3],
    [4, 3, 3, 1],
];

const STEP = 0.001;

// https://github.com/open-spaced-repetition/fsrs-rs/blob/main/src/parameter_clipper.rs#L41
// https://github.com/open-spaced-repetition/ts-fsrs/blob/main/src/fsrs/constant.ts#L49

const slider_names: string[] = [
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

const clamp = CLAMP_PARAMETERS(W17_W18_Ceiling);

export const sliders: SliderInfo[] = slider_names
    .map((name, i) => ({ name: `${i}. ${name}`, min: clamp[i][0], max: clamp[i][1], step: STEP }));

export const additionalSliders: SliderInfo[] = [
    { name: "desired retention", min: 0.8, max: 0.99, step: 0.01 },
];
