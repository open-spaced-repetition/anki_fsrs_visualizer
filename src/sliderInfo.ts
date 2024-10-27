export interface SliderInfo {
    name: string
    min: number
    max: number
}

// https://github.com/open-spaced-repetition/ts-fsrs/blob/main/src/fsrs/default.ts
// https://github.com/open-spaced-repetition/fsrs-rs/blob/main/src/inference.rs

export const default_parameters = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
    1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,];

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
    { name: "5. initial difficulty (multiplier)", min: 0.001, max: 4 },
    { name: "6. difficulty (multiplier)", min: 0.001, max: 4 },
    { name: "7. difficulty (multiplier)", min: 0.001, max: 0.75 },
    { name: "8. stability (exponent)", min: 0, max: 4.5 },
    { name: "9. stability (negative power)", min: 0.0, max: 0.8 },
    { name: "10. stability (exponent)", min: 0.001, max: 3.5 },
    { name: "11. fail stability (multiplier)", min: 0.001, max: 5 },
    { name: "12. fail stability (negative power)", min: 0.001, max: 0.25 },
    { name: "13. fail stability (power)", min: 0.001, max: 0.9 },
    { name: "14. fail stability (exponent)", min: 0.0, max: 4 },
    { name: "15. stability (multiplier for Hard)", min: 0, max: 1 },
    { name: "16. stability (multiplier for Easy)", min: 1, max: 6 },
    { name: "17. short-term stability (exponent)", min: 0.0, max: 2.0 },
    { name: "18. short-term stability (exponent)", min: 0.0, max: 2.0 }
];

export const additionalSliders: SliderInfo[] = [
    { name: "desired retention", min: 0.8, max: 0.99 },
];
