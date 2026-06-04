<template>
    <div class="container-top">
        <div class="reviews">
            <div class="reviews-header">
                <b>FSRS-6</b>
                <a href="https://github.com/open-spaced-repetition/anki_fsrs_visualizer/" class="github-link">Github</a>
                <button @click="resetReviews">Reset reviews</button>
                <span class="small-hint">1=Again, 2=Hard, 3=Good, 4=Easy</span>
            </div>
            <textarea v-model="reviewsText"></textarea>
        </div>
        <div class="chart-container">
            <Line :data="data" :options="options" />
        </div>
    </div>
    <div class="whole">
        <input class="whole-input" v-model.lazy="wText" @change="commit" />
    </div>
    <div class="action-bar">
        <button @click="reset">Reset parameters</button>
        <button @click="undo" :disabled="!canUndo">Undo</button>
        <button @click="redo" :disabled="!canRedo">Redo</button>
        {{ undoStack.length }} / {{ redoStack.length + undoStack.length }}
        <div>
            <input id="mode-interval" type="radio" :value="nameof<Card>('interval')" v-model="mode" />
            <label for="mode-interval">Interval</label>
        </div>
        <div>
            <input id="mode-stability" type="radio" :value="nameof<Card>('stability')" v-model="mode" />
            <label for="mode-stability">Stability</label>
        </div>
        <div>
            <input id="mode-displayDifficulty" type="radio" :value="nameof<Card>('displayDifficulty')" v-model="mode" />
            <label for="mode-displayDifficulty">Difficulty</label>
        </div>
        <div>
            <input id="mode-cumulativeInterval" type="radio" :value="nameof<Card>('cumulativeInterval')"
                v-model="mode" />
            <label for="mode-cumulativeInterval">CumulativeInterval</label>
        </div>
        <div>
            <input id="animation" type="checkbox" v-model="animation" />
            <label for="animation">Animation</label>
        </div>
        <div>
            <input id="log-scale" type="checkbox" v-model="useLogScale" />
            <label for="log-scale">Logarithmic</label>
        </div>
        <div title="Enables 10m learning and relearning steps">
            <input id="short-term" type="checkbox" v-model="shortTerm" />
            <label for="short-term">Short term</label>
        </div>
    </div>
    <div class="slider-container">
        <Slider v-for="(slider, index) in additionalSliders" :key="index" :info="slider" v-model="fsrsParams.m[index]"
            @change="commit" />
        <Slider v-for="(slider, index) in sliders" :key="index" :info="slider" v-model="fsrsParams.w[index]"
            @change="commit" />
    </div>
    <table class="table-dataset">
        <thead>
            <tr>
                <td>Grade</td>
                <td v-for="(label, index) in data.labels" :key="index">
                    {{ modeOf(mode) }}-{{ label }}
                </td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="dataset in data.datasets" :key="dataset.label">
                <td>{{ dataset.label }}</td>
                <td v-for="(item, index) in dataset.data" :key="index">
                    {{ cardDataFormat(item.card, mode) }}
                </td>
            </tr>
        </tbody>
    </table>
</template>
<style src="./assets/app.css" scoped></style>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    Colors,
} from 'chart.js';
import type { ChartData, ChartDataset } from 'chart.js';
import { Card, TsFsrsCalculator } from './tsFsrsCalculator';
import { sliders, additionalSliders, default_w as defaultW, initial_reviews as initialReviews } from './sliderInfo';
import { useManualRefHistory } from '@vueuse/core';
import zoomPlugin from 'chartjs-plugin-zoom';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { createOptions, linearScaleOptions, logarithmicScaleOptions } from './chartOptions.js';
import { Line } from 'vue-chartjs';
import Slider from './Slider.vue';
import { useRouter, useRoute } from 'vue-router';
import { type Steps } from 'ts-fsrs';

const router = useRouter();
const route = useRoute();

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    Colors,
    zoomPlugin,
    ChartDataLabels
);

function nameof<T>(name: keyof T) { return name; }

function modeOf(mode: keyof Card) {
    const modeMap: { [key in keyof Card]?: string } = {
        interval: 'Ivl',
        stability: 'S',
        displayDifficulty: 'D',
        cumulativeInterval: 'CIvl'
    };

    return modeMap[mode] || '';
}

function cardDataFormat(card: Card, mode: keyof Card) {
    if (mode === 'interval' || mode === 'cumulativeInterval') {
        return card[mode].toFixed(0);
    } else {
        return card[mode].toFixed(2);
    }
}

const mode = ref<keyof Card>("interval");
const animation = ref(true);
const useLogScale = ref(false);
const shortTerm = ref(false);
const gradeNames = ['', 'Again', 'Hard', 'Good', 'Easy'];
const stateNames = ['New', 'Learning', 'Review', 'Relearning'];

function calcTooltip(item: MyData) {
    const reviewText = item.review.join('');

    const name = gradeNames[item.x];
    const stability = item.card.stability.toFixed(2);
    const displayDifficulty = item.card.displayDifficulty.toFixed(0);
    const difficulty = item.card.difficulty.toFixed(2);
    const state = stateNames[item.card.state];

    return `${reviewText}: ${name}, Stability: ${stability}, D: ${displayDifficulty}% (${difficulty}), State: ${state}`;
}

function calcTitle(items: MyData[]) {
    const unique = [...new Set(items.map(a => a.y))];
    return `${mode.value}: ${unique.join(', ')}`;
}

const options = computed(() => {
    const baseOptions = createOptions({
        title_function: calcTitle,
        tooltip_function: calcTooltip,
    });

    const scaleOptions = useLogScale.value ? logarithmicScaleOptions : linearScaleOptions;

    return {
        ...baseOptions,
        animation: {
            duration: animation.value ? 500 : 0
        },
        scales: {
            ...baseOptions.scales,
            y: scaleOptions,
        }
    };
});

function getDataLabel(card: Card) {
    return `${gradeNames[card.grade]} (Difficulty: ${card.displayDifficulty.toFixed(0)}%)`;
}

function convertCardToMyData(card: Card, review: number[]): MyData {
    return {
        x: card.grade,
        y: card[mode.value] as number,
        card: card,
        review: review,
        label: getDataLabel(card),
    };
}

const reviews = ref(initialReviews);

const reviewsText = computed({
    get: () => reviews.value.map(a => a.join('')).join('\n'),
    set: (newValue) => reviews.value = newValue.split('\n')
        .map(a => a.split('').filter(b => ['1', '2', '3', '4'].includes(b)).map(Number)),
});

const initialM = [0.9];

const fsrsParams = ref({
    w: [...defaultW],
    m: [...initialM],
});

watch(() => route.query, (query) => {
    fsrsParams.value.w = parseParameters(query.w as string || '', defaultW);
    fsrsParams.value.m = parseParameters(query.m as string || '', initialM);
}, { immediate: true });

const { commit, undo, redo, canUndo, canRedo, undoStack, redoStack } = useManualRefHistory(fsrsParams, { clone: true });

function createLabels() {
    const max = Math.max(...reviews.value.map(a => a.length));
    return Array.from({ length: max }, (_, index) => `${index}`);
}

const data = computed<ChartData<'line', MyData[]>>(() => {
    const steps: Steps = shortTerm.value ? ['10m'] : [];
    const calc = new TsFsrsCalculator(fsrsParams.value.w, fsrsParams.value.m, steps, steps);

    return {
        labels: createLabels(),
        datasets: reviews.value.map(review => ({
            label: review.join(''),
            pointRadius: 4,
            pointHoverRadius: 5,
            data: calc.steps(review).map(a => convertCardToMyData(a, review)),
        } as ChartDataset<'line', MyData[]>)),
    };
});

function parseParameters(value: string, defaultValue: readonly number[]) {
    if (!value) return [...defaultValue];
    return resizeArray(value.replaceAll(', ', ',').split(',').map((a: string) => parseFloat(a) || 0), defaultValue.length, 0.0);
}

function paramsToString(value: number[], fixed: number, sep: string) {
    return value.map((f: number) => f.toFixed(fixed)).join(sep);
}

const wText = computed({
    get: () => paramsToString(fsrsParams.value.w, 4, ', '),
    set: (newValue) => fsrsParams.value.w = parseParameters(newValue, defaultW),
});

watch(fsrsParams, (newValue) => {
    router.replace({
        query: {
            w: paramsToString(newValue.w, 4, ','),
            m: paramsToString(newValue.m, 2, ','),
        }
    });
}, { deep: true });

function resizeArray<T>(arr: T[], length: number, filler: T): T[] {
    return arr.concat(new Array(Math.max(length - arr.length, 0)).fill(filler));
}

function reset() {
    fsrsParams.value.w = [...defaultW];
    fsrsParams.value.m = [...initialM];
    commit();
}

function resetReviews() {
    reviews.value = initialReviews;
}

export interface MyData {
    x: number;
    y: number;
    label: string;
    review: number[];
    card: Card;
}
</script>
