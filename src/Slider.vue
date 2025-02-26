<template>
    <div class="slider">
        <div class="slider-name">{{ props.info.name }}</div>
        <div>
            <input class="slider-number" type="number" :step="props.info.step" v-model.number="model" :min="props.info.min" :max="props.info.max" @change="onChange" />
        </div>
        <div class="slider-range-container">
            <div class="minmax minmax-rt">
                {{ props.info.min }}
            </div>
            <div style="flex: 1;">
                <input class="slider-range-input" type="range" :step="props.info.step" v-model.number="model" :min="props.info.min" :max="props.info.max" @change="onChange" />
            </div>
            <div class="minmax">
                {{ props.info.max }}
            </div>
        </div>
    </div>
</template>
<style>
.slider {
    display: flex;
    align-items: center;
    column-gap: 3px;
    flex-wrap: wrap;
}
.slider-name {
    white-space: nowrap;
    width: 16em;
}
.slider-number {
    width: 6em;
}
.slider-range-container {
    flex: 1;
    min-width: 10em;
    display: flex;
    column-gap: 5px;
}
.minmax {
    width: 2.0em;
}
.minmax-rt {
    text-align: right;
}
.slider-range-input {
    width: 100%;
}
</style>
<script lang="ts" setup>
import { type SliderInfo } from './sliderInfo';

const props = defineProps<{ info: SliderInfo }>();

const emit = defineEmits<{
    change: (payload: Event) => void
}>();

const model = defineModel<number>();

function onChange(event: Event) {
    emit('change', event);
}
</script>
