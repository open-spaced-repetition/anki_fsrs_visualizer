export interface SliderInfo {
    name: string
    min: number
    max: number
}

export const sliders: SliderInfo[] = [
    { name: "0. initial stability (Again)", min: 0.1, max: 100 },
    { name: "1. initial stability (Hard)", min: 0.1, max: 100 },
    { name: "2. initial stability (Good)", min: 0.1, max: 100 },
    { name: "3. initial stability (Easy)", min: 0.1, max: 100 },
    { name: "4. initial difficulty (Good)", min: 1, max: 10 },
    { name: "5. initial difficulty (multiplier)", min: 0.1, max: 5 },
    { name: "6. difficulty (multiplier)", min: 0.1, max: 5 },
    { name: "7. difficulty (multiplier)", min: 0, max: 0.75 },
    { name: "8. stability (exponent)", min: 0, max: 4 },
    { name: "9. stability (negative power)", min: 0.1, max: 0.8 },
    { name: "10. stability (exponent)", min: 0.01, max: 3.0 },
    { name: "11. fail stability (multiplier)", min: 0.5, max: 5 },
    { name: "12. fail stability (negative power)", min: 0.01, max: 0.2 },
    { name: "13. fail stability (power)", min: 0.01, max: 0.9 },
    { name: "14. fail stability (exponent)", min: 0.01, max: 3 },
    { name: "15. stability (multiplier for Hard)", min: 0, max: 1 },
    { name: "16. stability (multiplier for Easy)", min: 1, max: 6 },
];

export const additionalSliders: SliderInfo[] = [
    { name: "desired retention", min: 0.8, max: 0.99 },
    { name: "decay", min: -2, max: -0.1 },
    { name: "factor", min: 0.01, max: 2 },
];
