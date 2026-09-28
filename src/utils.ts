import type { Grade } from 'ts-fsrs';

export function parseParameters(value: string, defaultValue: readonly number[]): number[] {
    if (!value) {
        return [...defaultValue];
    }
    const parsed = value.split(',').map(a => parseFloat(a.trim()));
    return Array.from({ length: defaultValue.length }, (_, i) => {
        const val = parsed[i];
        if (typeof val === 'number' && !isNaN(val)) return val;
        return defaultValue[i] ?? 0;
    });
}

export function parseRawParameters(value: string): number[] {
    if (!value) return [];
    return value.split(',')
        .map(a => parseFloat(a.trim()))
        .filter(n => typeof n === 'number' && !isNaN(n));
}

export function padWeights(weights: readonly number[], targetLength: number): number[] {
    return Array.from({ length: targetLength }, (_, i) => weights[i] ?? 0);
}

export function paramsToString(value: readonly number[], fixed = 4, sep = ', '): string {
    return value.map((f: number) => f.toFixed(fixed)).join(sep);
}

export function parseReviewsText(text: string): Grade[][] {
    if (!text) return [];
    return text.split('\n')
        .map(line => line.split('').filter(ch => ['1', '2', '3', '4'].includes(ch)).map(ch => Number(ch) as Grade));
}

export function formatReviewsText(reviews: number[][]): string {
    return reviews.map(r => r.join('')).join('\n');
}

export function calcDisplayDifficulty(d: number): number {
    return ((d - 1.0) / 9.0) * 100.0;
}
