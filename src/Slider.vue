<template>
    <div class="slider" :class="{ 'is-disabled': props.disabled }">
        <div class="slider-name">
            {{ props.info.name }}
        </div>
        <input class="slider-number" type="number" :step="props.info.step" v-model.number="model" :min="props.info.min"
            :max="props.info.max" :disabled="props.disabled" @change="onChange" />
        <div class="slider-range-container">
            <div class="minmax minmax-rt">
                {{ props.info.min }}
            </div>
            <div style="flex: 1;">
                <input class="slider-range-input" type="range" :step="props.info.step" v-model.number="model"
                    :min="props.info.min" :max="props.info.max" :disabled="props.disabled" @change="onChange" />
            </div>
            <div class="minmax">
                {{ props.info.max }}
            </div>
        </div>
    </div>
</template>
<style src="./assets/slider.css" scoped></style>
<script lang="ts" setup>
import type { SliderInfo } from './types';

const props = withDefaults(defineProps<{
    info: SliderInfo;
    disabled?: boolean;
}>(), {
    disabled: false,
});

const emit = defineEmits<{
    change: [Event],
}>();

const model = defineModel<number>();

function onChange(event: Event) {
    if (props.disabled) return;
    emit('change', event);
}
</script>
