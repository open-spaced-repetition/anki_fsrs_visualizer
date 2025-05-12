export interface SliderInfo {
    name: string;
    min: number;
    max: number;
    step: number;
}

// https://github.com/open-spaced-repetition/ts-fsrs/blob/main/src/fsrs/default.ts
// https://github.com/open-spaced-repetition/fsrs-rs/blob/main/src/inference.rs

const FSRS6_DEFAULT_DECAY = 0.2;

export const default_parameters = [
    0.2172, 1.1771, 3.2602, 16.1507, 7.0114, 0.57, 2.0966, 0.0069, 1.5261,
    0.112, 1.0178, 1.849, 0.1133, 0.3127, 2.2934, 0.2191, 3.0004, 0.7536,
    0.3332, 0.1437, FSRS6_DEFAULT_DECAY];

export const initial_reviews: number[][] = [
    [3, 3, 3, 3],
    [3, 3, 3, 2],
    [3, 3, 3, 1],
    [2, 3, 3, 3],
    [1, 3, 3, 3],
    [4, 3, 3, 1],
];

const S_MIN = 0.001;
const INIT_S_MAX = 100.0;
const STEP = 0.001;

// https://github.com/open-spaced-repetition/fsrs-rs/blob/main/src/parameter_clipper.rs
export const sliders: SliderInfo[] = [
    { name: "0. initial stability (Again)", min: S_MIN, max: INIT_S_MAX, step: STEP },
    { name: "1. initial stability (Hard)", min: S_MIN, max: INIT_S_MAX, step: STEP },
    { name: "2. initial stability (Good)", min: S_MIN, max: INIT_S_MAX, step: STEP },
    { name: "3. initial stability (Easy)", min: S_MIN, max: INIT_S_MAX, step: STEP },
    { name: "4. initial difficulty (Good)", min: 1, max: 10, step: STEP },
    { name: "5. initial difficulty (multiplier)", min: 0.001, max: 4, step: STEP },
    { name: "6. difficulty (multiplier)", min: 0.001, max: 4, step: STEP },
    { name: "7. difficulty (multiplier)", min: 0.001, max: 0.75, step: STEP },
    { name: "8. stability (exponent)", min: 0, max: 4.5, step: STEP },
    { name: "9. stability (negative power)", min: 0.0, max: 0.8, step: STEP },
    { name: "10. stability (exponent)", min: 0.001, max: 3.5, step: STEP },
    { name: "11. fail stability (multiplier)", min: 0.001, max: 5, step: STEP },
    { name: "12. fail stability (negative power)", min: 0.001, max: 0.25, step: STEP },
    { name: "13. fail stability (power)", min: 0.001, max: 0.9, step: STEP },
    { name: "14. fail stability (exponent)", min: 0.0, max: 4, step: STEP },
    { name: "15. stability (multiplier for Hard)", min: 0, max: 1, step: STEP },
    { name: "16. stability (multiplier for Easy)", min: 1, max: 6, step: STEP },
    { name: "17. short-term stability (exponent)", min: 0.0, max: 2.0, step: STEP },
    { name: "18. short-term stability (addition)", min: 0.0, max: 2.0, step: STEP },
    { name: "19. short-term stability (power)", min: 0.0, max: 0.8, step: STEP },
    { name: "20. decay", min: 0.1, max: 0.8, step: STEP },
];

export const additionalSliders: SliderInfo[] = [
    { name: "desired retention", min: 0.8, max: 0.99, step: 0.01 },
];
