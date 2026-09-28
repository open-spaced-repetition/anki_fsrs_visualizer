<template>
    <div class="container-top">
        <div class="reviews">
            <div class="reviews-header">
                <div class="algo-select-container">
                    <select id="algorithm-select" :value="algoId" @change="onAlgorithmChange" class="algo-select">
                        <option v-for="algo in algorithms" :key="algo.id" :value="algo.id">
                            {{ algo.name }}
                        </option>
                    </select>
                </div>
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
        <input class="whole-input" :class="{ 'is-default': isDefaultParameters }" v-model.lazy="wText" @change="commitParameters" />
    </div>
    <p v-if="calculation.error" role="alert">Unable to calculate: {{ calculation.error }}</p>
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
            <label for="mode-stability">{{ algoId === 'fsrs-7' ? 'Slow stability (SS)' : 'Stability' }}</label>
        </div>
        <div v-if="algoId === 'fsrs-7'">
            <input id="mode-stabilityFast" type="radio" :value="nameof<Card>('stabilityFast')" v-model="mode" />
            <label for="mode-stabilityFast">Fast stability (SF)</label>
        </div>
        <div>
            <input id="mode-displayDifficulty" type="radio" :value="nameof<Card>('displayDifficulty')" v-model="mode" />
            <label for="mode-displayDifficulty">Difficulty</label>
        </div>
        <div>
            <input id="mode-cumulativeInterval" type="radio" :value="nameof<Card>('cumulativeInterval')"
                v-model="mode" />
            <label for="mode-cumulativeInterval">Cumulative Interval</label>
        </div>
        <div>
            <input id="animation" type="checkbox" v-model="animation" />
            <label for="animation">Animation</label>
        </div>
        <div>
            <input id="log-scale" type="checkbox" v-model="useLogScale" />
            <label for="log-scale">Logarithmic</label>
        </div>
    </div>
    <div class="slider-container">
        <Slider v-for="(slider, index) in additionalSliders" :key="index" :info="slider" v-model="fsrsParams.m[index]"
            @change="commit" />
        <Slider v-for="(slider, index) in currentAlgorithm.sliders" :key="`${algoId}-${index}`" :info="slider"
            v-model="fsrsParams.w[index]" @change="commitParameters" />
    </div>
    <table class="table-dataset">
        <thead>
            <tr>
                <td>Grade</td>
                <td v-for="(label, index) in data.labels" :key="index">
                    {{ modeOf(mode, algoId === 'fsrs-7') }}-{{ label }}
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
import type { Card } from './types';
import {
    additionalSliders,
    algorithms,
    defaultAlgorithm,
    detectAlgorithm,
    initialReviews,
    createSteps,
} from './tsFsrsCalculator';
import {
    nameof,
    modeOf,
    cardDataFormat,
    calcTooltip,
    calcTitle,
    convertCardToMyData,
    createLabels,
    type MyData,
} from './chartHelpers';
import { parseParameters, parseRawParameters, paramsToString, parseReviewsText, formatReviewsText } from './utils';
import { useManualRefHistory } from '@vueuse/core';
import zoomPlugin from 'chartjs-plugin-zoom';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { createOptions, linearScaleOptions, logarithmicScaleOptions } from './chartOptions';
import { Line } from 'vue-chartjs';
import Slider from './Slider.vue';
import { useRouter, useRoute } from 'vue-router';

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

const mode = ref<keyof Card>("interval");
const animation = ref(true);
const useLogScale = ref(false);

const options = computed(() => {
    const baseOptions = createOptions({
        title_function: (items) => calcTitle(items, modeOf(mode.value, algoId.value === 'fsrs-7')),
        tooltip_function: calcTooltip,
    });
    const scaleOptions = useLogScale.value ? logarithmicScaleOptions : linearScaleOptions;
    if (algoId.value === 'fsrs-7' && baseOptions.plugins?.zoom) {
        baseOptions.plugins.zoom = {
            ...baseOptions.plugins.zoom,
            limits: { y: { min: useLogScale.value ? Number.MIN_VALUE : 0, minRange: 0 } },
        };
    }

    return {
        ...baseOptions,
        animation: {
            duration: animation.value ? 500 : 0
        },
        scales: {
            ...baseOptions.scales,
            y: algoId.value === 'fsrs-7' ? {
                ...scaleOptions,
                min: useLogScale.value ? undefined : 0,
                max: undefined,
                ticks: {},
            } : scaleOptions,
        }
    };
});

const reviews = ref(initialReviews);

const reviewsText = computed({
    get: () => formatReviewsText(reviews.value),
    set: (newValue) => {
        reviews.value = parseReviewsText(newValue);
    },
});

const initialM: readonly number[] = [0.9];

const algoId = ref(defaultAlgorithm.id);

const fsrsParams = ref({
    w: [...defaultAlgorithm.defaultWeights],
    m: [...initialM],
});

const currentAlgorithm = computed(() => algorithms[algoId.value] || defaultAlgorithm);

watch(() => route.query, (query) => {
    const rawW = query.w ? parseRawParameters(query.w as string) : [];
    const queryAlgo = (query.a ?? query.algo) as string | undefined;
    const algo = detectAlgorithm(
        typeof queryAlgo === 'string' ? queryAlgo : undefined,
        rawW.length > 0 ? rawW.length : undefined
    );

    const w = query.w ? parseParameters(query.w as string, algo.defaultWeights) : [...algo.defaultWeights];
    const m = query.m ? parseParameters(query.m as string, initialM) : [...initialM];

    algoId.value = algo.id;
    fsrsParams.value.w = algo.clamp(w);
    fsrsParams.value.m = m;
}, { immediate: true });

const { commit, undo, redo, clear, canUndo, canRedo, undoStack, redoStack } = useManualRefHistory(fsrsParams, { clone: true });

watch(algoId, () => {
    // Weight layouts differ between models, so parameter undo stays within one model.
    commit();
    clear();
    if (algoId.value !== 'fsrs-7' && mode.value === 'stabilityFast') mode.value = 'stability';
});

function commitParameters() {
    fsrsParams.value.w = currentAlgorithm.value.clamp(fsrsParams.value.w);
    commit();
}

function onAlgorithmChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newAlgoId = target.value;
    if (newAlgoId === algoId.value) return;

    const nextAlgo = algorithms[newAlgoId] || defaultAlgorithm;

    algoId.value = nextAlgo.id;
    fsrsParams.value.w = [...nextAlgo.defaultWeights];
    commit();
}

const calculation = computed(() => {
    try {
        const params = {
            weights: currentAlgorithm.value.clamp(fsrsParams.value.w),
            requestRetention: fsrsParams.value.m[0] ?? 0.9,
        };
        const steps = createSteps(currentAlgorithm.value.scheduler(params));
        return {
            cards: reviews.value.map(review => steps(review)),
            error: '',
        };
    } catch (error) {
        return {
            cards: [] as Card[][],
            error: error instanceof Error ? error.message : String(error),
        };
    }
});

const data = computed<ChartData<'line', MyData[]>>(() => {
    return {
        labels: createLabels(reviews.value),
        datasets: reviews.value.map((review, index) => ({
            label: review.join(''),
            pointRadius: 4,
            pointHoverRadius: 5,
            data: (calculation.value.cards[index] ?? []).map(a => convertCardToMyData(a, review, mode.value)),
        } as ChartDataset<'line', MyData[]>)),
    };
});

const wText = computed({
    get: () => paramsToString(fsrsParams.value.w, 4, ', '),
    set: (newValue) => {
        fsrsParams.value.w = parseParameters(newValue, currentAlgorithm.value.defaultWeights);
    },
});

const isDefaultParameters = computed(() => {
    return paramsToString(fsrsParams.value.w, 4, ',') === paramsToString(currentAlgorithm.value.defaultWeights, 4, ',');
});

const isDefaultM = computed(() => {
    return paramsToString(fsrsParams.value.m, 2, ',') === paramsToString(initialM, 2, ',');
});

watch([algoId, fsrsParams], ([newAlgoId, newState]) => {
    router.replace({
        query: {
            a: newAlgoId,
            w: isDefaultParameters.value ? undefined : paramsToString(newState.w, 4, ','),
            m: isDefaultM.value ? undefined : paramsToString(newState.m, 2, ','),
        }
    });
}, { deep: true, immediate: true });

function reset(): void {
    fsrsParams.value.w = [...currentAlgorithm.value.defaultWeights];
    fsrsParams.value.m = [...initialM];
    commit();
}

function resetReviews(): void {
    reviews.value = initialReviews;
}
</script>
