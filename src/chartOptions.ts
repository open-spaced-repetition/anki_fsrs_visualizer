import type { ChartOptions, TooltipItem, TooltipModel } from 'chart.js';
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

export function createOptions(params: { title_function: (raw: any) => string, tooltip_function: (raw: any) => string; }): ChartOptions<'line'> {
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
                type: 'linear',
                ticks: {
                    format: {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
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
                display: true,
                formatter: (obj, _) => obj.label, //TODO: type
            },
            colors: {
                forceOverride: true,
            },
            tooltip: {
                callbacks: {
                    title: function (this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
                        return params.title_function(tooltipItems.map(a => a.raw));
                    },
                    label: function (this: TooltipModel<"line">, tooltipItem: TooltipItem<"line">) {
                        return params.tooltip_function(tooltipItem.raw);
                    }
                }
            },
        }
    };
}
