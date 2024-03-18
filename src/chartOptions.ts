import type { ChartOptions } from 'chart.js';
import type { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options';
import type { TypedChartComponent } from 'node_modules/vue-chartjs/dist/types';

const zoomOptions: ZoomPluginOptions = {
    limits: {
        y: { min: 0, minRange: 10 },
    },
    pan: {
        enabled: true,
        mode: 'y',
    },
    zoom: {
        wheel: {
            enabled: true,
        },
        pinch: {
            enabled: true,
        },
        mode: 'y',
    }
};

export function createOptions(): ChartOptions<'line'> {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 500,
        },
        scales: {
            y: {
                display: true,
                min: 0,
                max: 75,
                ticks: {
                    format: {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                    },
                }
            }
        },
        plugins: {
            zoom: zoomOptions,
            datalabels: {
                color: '#36A2EB',
                align: 'left',
                anchor: 'center',
                display: 'auto',
                formatter: (obj, _) => obj.label, //TODO: type
            },
            colors: {
                forceOverride: true,
            }
        }
    };
}

//TODO: this doesn't work now
export declare const MyLine: TypedChartComponent<"line", MyData[], unknown>;

export interface MyData {
    x: number,
    y: number,
    label: string,
}
