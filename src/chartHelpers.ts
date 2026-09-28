import type { Card } from './types';

export interface MyData {
    x: number;
    y: number;
    label: string;
    review: number[];
    card: Card;
}

export const gradeNames: readonly string[] = ['', 'Again', 'Hard', 'Good', 'Easy'];
export const stateNames: readonly string[] = ['New', 'Learning', 'Review', 'Relearning'];

export function nameof<T>(name: keyof T): keyof T {
    return name;
}

export function modeOf(modeKey: keyof Card, dualStability = false): string {
    const modeMap: { [key in keyof Card]?: string } = {
        interval: 'Ivl',
        stability: dualStability ? 'SS' : 'S',
        stabilityFast: 'SF',
        displayDifficulty: 'D',
        cumulativeInterval: 'CIvl'
    };
    return modeMap[modeKey] || '';
}

export function cardDataFormat(card: Card, modeKey: keyof Card): string {
    if (!card || card[modeKey] === undefined) return '-';
    if (modeKey === 'interval' || modeKey === 'cumulativeInterval') {
        return card.stabilityFast === undefined ? Math.round(card[modeKey]).toString() : card[modeKey].toFixed(6);
    }
    return card[modeKey]!.toFixed(modeKey === 'stabilityFast' ? 4 : 2);
}

export function calcTooltip(item: MyData): string {
    if (!item || !item.card) return '';
    const reviewText = item.review.join('');
    const gradeName = gradeNames[item.x] || 'Unknown';
    const interval = cardDataFormat(item.card, 'interval');
    const stability = (item.card.stability ?? 0).toFixed(2);
    const displayDifficulty = (item.card.displayDifficulty ?? 0).toFixed(0);
    const difficulty = (item.card.difficulty ?? 0).toFixed(2);
    const stateName = stateNames[item.card.state] || 'Unknown';
    const { stabilityFast } = item.card;
    const stabilityText = stabilityFast === undefined
        ? `Stability: ${stability}`
        : `Slow stability (SS): ${stability}, Fast stability (SF): ${stabilityFast.toFixed(4)}`;

    return `${reviewText}: ${gradeName}, Interval: ${interval} ${stabilityText}, Difficulty: ${displayDifficulty}% (${difficulty}), State: ${stateName}`;
}

export function calcTitle(items: MyData[], mode: string): string {
    if (!items || items.length === 0) return '';
    const unique = [...new Set(items.map(a => a.y))];
    return `${mode}: ${unique.join(', ')}`;
}

export function getDataLabel(card: Card, mode: keyof Card): string {
    if (!card) return '';
    let details = '';

    if (mode === 'stability' || mode === 'stabilityFast') {
        details = `${cardDataFormat(card, mode)}, ${(card.displayDifficulty ?? 0).toFixed(0)}%`;
    } else if (mode === 'displayDifficulty') {
        details = `${(card.displayDifficulty ?? 0).toFixed(2)}%, ${(card.difficulty ?? 0).toFixed(2)}`;
    } else {
        details = `${cardDataFormat(card, mode)}, ${(card.displayDifficulty ?? 0).toFixed(0)}%`;
    }
    return `${gradeNames[card.grade] || ''} (${details})`;
}

export function convertCardToMyData(card: Card, review: number[], mode: keyof Card): MyData {
    const val = card[mode];
    return {
        x: card.grade,
        y: (typeof val === 'number' ? val : 0),
        card,
        review,
        label: getDataLabel(card, mode),
    };
}

export function createLabels(reviewsList: number[][]): string[] {
    const maxLen = reviewsList.length > 0 ? Math.max(...reviewsList.map(a => a.length)) : 0;
    return Array.from({ length: maxLen }, (_, index) => `${index}`);
}
