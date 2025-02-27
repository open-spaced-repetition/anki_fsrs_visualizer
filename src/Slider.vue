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
<style src="./assets/slider.css" scoped></style>
<script lang="ts" setup>
import { type SliderInfo } from './sliderInfo';

const props = defineProps<{ info: SliderInfo }>();

const emit = defineEmits<{
    change: [Event],
}>();

const model = defineModel<number>();

function onChange(event: Event) {
    emit('change', event);
}
</script>
