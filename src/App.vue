<template>
  <div class="container-top">
    <div class="scores">
      <div>
        <button @click="resetScores">Reset reviews</button>
      </div>
      <textarea v-model="scores_text"></textarea>
    </div>
    <div style="position: relative; flex: 1;">
      <Line :data="data" :options="options" />
    </div>
  </div>
  <div class="whole">
    <input v-model.lazy="w_text" style="height: 100%; width: 100%; box-sizing: border-box; resize: none;" />
  </div>
  <div style="display: flex; flex-wrap: wrap; gap: 2px; align-items: center;">
    <button @click="reset">Reset weights</button>
    <button @click="undo" :disabled='!canUndo'>Undo</button>
    <button @click="redo" :disabled='!canRedo'>Redo</button>
    {{ undoStack.length }} / {{ redoStack.length + undoStack.length }}
    <div>
      <input id="mode-interval" type="radio" value="interval" v-model="mode" />
      <label for="mode-interval">Interval</label>
    </div>
    <div>
      <input id="mode-cumulativeInterval" type="radio" value="cumulativeInterval" v-model="mode" />
      <label for="mode-cumulativeInterval">Cumulative</label>
    </div>
    <div>
      <input id="mode-realDifficulty" type="radio" value="realDifficulty" v-model="mode" />
      <label for="mode-realDifficulty">Difficulty</label>
    </div>
    <div>
      <input id="animation" type="checkbox" v-model="animation" />
      <label for="animation">Animation</label>
    </div>
  </div>
  <div style="font-size: 75%; width: 100%;">
    <!-- TODO: move to slider component -->
    <div class="slider">
      <div style="white-space: nowrap; width: 14em">{{ desiredRSlider.name }}</div>
      <div>
        <input style="width: 5em;" type="number" step="0.01" v-model="desiredR" :min="desiredRSlider.min"
          :max="desiredRSlider.max" v-on:change="commit" />
      </div>
      <div style="flex: 1; min-width: 10em; display: flex; column-gap: 5px;">
        <div class="minmax" style="text-align: right;">
          {{ desiredRSlider.min }}
        </div>
        <div style="flex: 1;">
          <input style="width: 100%;" type="range" step="0.01" v-model="desiredR" :min="desiredRSlider.min"
            :max="desiredRSlider.max" v-on:change="commit" />
        </div>
        <div class="minmax">
          {{ desiredRSlider.max }}
        </div>
      </div>
    </div>
    <div v-for="(slider, index) in sliders" class="slider">
      <div style="white-space: nowrap; width: 14em">{{ index }}. {{ slider.name }}</div>
      <div>
        <input style="width: 5em;" type="number" step="0.01" v-model="w[index]" :min="slider.min" :max="slider.max"
          v-on:change="commit" />
      </div>
      <div style="flex: 1; min-width: 10em; display: flex; column-gap: 5px;">
        <div class="minmax" style="text-align: right;">
          {{ slider.min }}
        </div>
        <div style="flex: 1;">
          <input style="width: 100%;" type="range" step="0.01" v-model="w[index]" :min="slider.min" :max="slider.max"
            v-on:change="commit" />
        </div>
        <div class="minmax">
          {{ slider.max }}
        </div>
      </div>
    </div>
  </div>
  <table class="table-dataset">
    <tr v-for="dataset in data.datasets">
      <td>{{ dataset.label }}</td>
      <td v-for="item in dataset.data">
        {{ item.y.toFixed(2) }}
      </td>
    </tr>
  </table>
  <a href="https://github.com/open-spaced-repetition/anki_fsrs_visualizer/" style="font-size: 75%;">Github</a>
</template>
<style>
textarea {
  flex: 1;
  box-sizing: border-box;
}

.container-top {
  display: flex;
  height: 50vh;
  gap: 3px;
}

.scores {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.minmax {
  width: 1.5em;
}

@media screen and (max-width: 600px) {
  .container-top {
    flex-direction: column;
  }

  .scores {
    height: 10vh;
    width: 100%;
  }
}

.whole {
  width: 100%;
}

.whole input {
  width: 100%;
}

.slider {
  display: flex;
  align-items: center;
  column-gap: 3px;
  flex-wrap: wrap;
}

.table-dataset {
  border-collapse: collapse;
}

.table-dataset tr:nth-child(even) {
  background-color: #f2f2f2;
}

.table-dataset td {
  border: 1px solid #ddd;
  text-align: right;
}
</style>

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
  Colors,
} from 'chart.js';
import type { ChartData, ChartDataset } from 'chart.js';
import { Card, FsrsCalculator } from './fsrsCalculator';
import { sliders, desiredRSlider } from './sliderInfo';
import { useManualRefHistory } from '@vueuse/core';
import zoomPlugin from 'chartjs-plugin-zoom';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { createOptions, MyLine, type MyData } from './chartOptions.js';
import { Line } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, Colors, zoomPlugin, ChartDataLabels);

const mode = ref<keyof Card>("interval");
const animation = ref(true);

//can't disable animation using reactive options, so using watch

watch(animation, a => {
  if (typeof options.animation == "object") {
    options.animation.duration = (a ? 500 : 0);
  }
});

const options = createOptions();

function getDataLabel(card: Card) {
  const names = ["", "Again", "Hard", "Good", "Easy"];
  return `${names[card.score]} ${card.realDifficulty.toFixed(0)}%`;
}

function convertCardToMyData(card: Card): MyData {
  return {
    x: 0.0, //unused but required
    y: card[mode.value] as number,
    label: getDataLabel(card)
  };
}

const initial_scores: number[][] = [
  [3, 3, 3, 3],
  [3, 3, 3, 2],
  [3, 3, 3, 1],
  [2, 3, 3, 3],
  [1, 3, 3, 3],
  [4, 3, 3, 1],
];

const scores = ref(initial_scores);

const scores_text = computed({
  get: () => scores.value.map(a => a.join('')).join('\n'),
  set: (newValue) => scores.value = newValue.split('\n').map(a => a.split('').filter(b => ['1', '2', '3', '4'].includes(b)).map(Number)),
});

const initial_w = [0.5614, 1.2546, 3.5878, 7.9731, 5.1043, 1.1303, 0.8230, 0.0465, 1.6290, 0.1350, 1.0045, 2.1320, 0.0839, 0.3204, 1.3547, 0.2190, 2.7849];
const w = ref([...initial_w]);
const desiredR = ref(0.9);

const { commit, undo, redo, canUndo, canRedo, undoStack, redoStack } = useManualRefHistory(w, { clone: a => [...a] });

function createLabels() {
  const max = Math.max(...scores.value.map(a => a.length));
  return Array.from({ length: max }, (_, i) => `${i}`)
}

function createData(): ChartData<'line', MyData[]> {
  const calc = new FsrsCalculator(w.value, desiredR.value);

  // could not use dataset's yAxisKey here because chart component is not watching it and doesn't update automatically

  return {
    labels: createLabels(),
    datasets: scores.value.map(score => {
      return {
        label: score.join(""),
        pointRadius: 4,
        pointHoverRadius: 5,
        data: calc.steps(score).map(convertCardToMyData),
      } as ChartDataset<'line', MyData[]>;
    }),
  };
}

const data = computed(createData);

const w_text = computed({
  get: () => w.value.join(', '),
  set: (newValue) => w.value = newValue.split(', ').map(parseFloat)
});

function reset() {
  for (let i in initial_w) {
    w.value[i] = initial_w[i];
  }

  commit();
}

function resetScores() {
  scores.value = initial_scores;
}
</script>
