interface SliderInfo {
    name: string
    min: number
    max: number
}

export const sliders: SliderInfo[] = [
    { name: "initial stability (Again)", min: 0.1, max: 365 },
    { name: "initial stability (Hard)", min: 0.1, max: 365 },
    { name: "initial stability (Good)", min: 0.1, max: 365 },
    { name: "initial stability (Easy)", min: 0.1, max: 365 },
    { name: "initial difficulty (Good)", min: 1, max: 10 },
    { name: "initial difficulty (multiplier)", min: 0.1, max: 5 },
    { name: "difficulty (multiplier)", min: 0.1, max: 5 },
    { name: "difficulty (multiplier)", min: 0, max: 0.5 },
    { name: "stability (exponent)", min: 0, max: 3 },
    { name: "stability (negative power)", min: 0.1, max: 0.8 },
    { name: "stability (exponent)", min: 0.01, max: 2.5 },
    { name: "fail stability (multiplier)", min: 0.5, max: 5 },
    { name: "fail stability (negative power)", min: 0.01, max: 0.2 },
    { name: "fail stability (power)", min: 0.01, max: 0.9 },
    { name: "fail stability (exponent)", min: 0.01, max: 2 },
    { name: "stability (multiplier for Hard)", min: 0, max: 1 },
    { name: "stability (multiplier for Easy)", min: 1, max: 4 },
];
