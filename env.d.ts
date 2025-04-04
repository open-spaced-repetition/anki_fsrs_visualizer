/// <reference types="vite/client" />

import 'chart.js';
import { ZoomPluginOptions } from 'chartjs-plugin-zoom';
import { DataLabelsPluginOptions } from 'chartjs-plugin-datalabels';

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        zoom?: ZoomPluginOptions;
        datalabels?: DataLabelsPluginOptions;
    }
}
