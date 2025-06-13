import { default_w, CLAMP_PARAMETERS, W17_W18_Ceiling } from "ts-fsrs";

export { default_w };

export interface SliderInfo {
    name: string;
    min: number;
    max: number;
    step: number;
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
