export interface SliderInfo {
    name: string
    min: number
    max: number
}

// https://github.com/open-spaced-repetition/fsrs-rs/blob/main/src/inference.rs
export const default_parameters = [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544, 1.0824, 1.9813,
    0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567];

export const initial_reviews: number[][] = [
    [3, 3, 3, 3],
    [3, 3, 3, 2],
    [3, 3, 3, 1],
    [2, 3, 3, 3],
    [1, 3, 3, 3],
    [4, 3, 3, 1],
];

// https://github.com/open-spaced-repetition/fsrs-rs/blob/main/src/parameter_clipper.rs
export const sliders: SliderInfo[] = [
    { name: "0. initial stability (Again)", min: 0.01, max: 100 },
    { name: "1. initial stability (Hard)", min: 0.01, max: 100 },
    { name: "2. initial stability (Good)", min: 0.01, max: 100 },
    { name: "3. initial stability (Easy)", min: 0.01, max: 100 },
    { name: "4. initial difficulty (Good)", min: 1, max: 10 },
    { name: "5. initial difficulty (multiplier)", min: 0.1, max: 5 },
    { name: "6. difficulty (multiplier)", min: 0.1, max: 5 },
    { name: "7. difficulty (multiplier)", min: 0, max: 0.75 },
    { name: "8. stability (exponent)", min: 0, max: 4 },
    { name: "9. stability (negative power)", min: 0.0, max: 0.8 },
    { name: "10. stability (exponent)", min: 0.01, max: 3 },
    { name: "11. fail stability (multiplier)", min: 0.5, max: 5 },
    { name: "12. fail stability (negative power)", min: 0.01, max: 0.2 },
    { name: "13. fail stability (power)", min: 0.01, max: 0.9 },
    { name: "14. fail stability (exponent)", min: 0.01, max: 3 },
    { name: "15. stability (multiplier for Hard)", min: 0, max: 1 },
    { name: "16. stability (multiplier for Easy)", min: 1, max: 6 },
    { name: "17. short-term stability (exponent)", min: 0.0, max: 2.0 },
    { name: "18. short-term stability (exponent)", min: 0.0, max: 2.0 }
];

export const additionalSliders: SliderInfo[] = [
    { name: "desired retention", min: 0.8, max: 0.99 },
];
