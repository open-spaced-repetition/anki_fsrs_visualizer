<template>
    <div class="slider">
        <div style="white-space: nowrap; width: 16em">{{ props.info.name }}</div>
        <div>
            <input style="width: 5em;" type="number" :step="props.info.step" v-model.number="model" :min="props.info.min"
                :max="props.info.max" v-on:change="event => $emit('change', event)" />
        </div>
        <div style="flex: 1; min-width: 10em; display: flex; column-gap: 5px;">
            <div class="minmax" style="text-align: right;">
                {{ props.info.min }}
            </div>
            <div style="flex: 1;">
                <input style="width: 100%;" type="range" :step="props.info.step" v-model.number="model" :min="props.info.min"
                    :max="props.info.max" v-on:change="event => $emit('change', event)" />
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

.minmax {
    width: 2.0em;
}
</style>
<script lang="ts" setup>
import { type SliderInfo } from './sliderInfo';

const props = defineProps<{ info: SliderInfo }>();

const emit = defineEmits<{
    change: [payload: Event]
}>();

const model = defineModel<number>();
</script>
