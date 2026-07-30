import { Chart, registerables } from 'chart.js';
import { calculateCosts, PRESETS } from './calculator.js';
Chart.register(...registerables);

let chartDau = null;
let chartArpu = null;

const GAME_KEYS = ['cod', 'diablo', 'destiny', 'wow', 'sf6'];
const GAME_LABELS = ['Call of Duty', 'Diablo IV', 'Destiny 2', 'World of Warcraft', 'Street Fighter 6'];
const GAME_COLORS = ['#38bdf8', '#818cf8', '#f59e0b', '#10b981', '#f43f5e'];
const GAME_FILLS = ['rgba(56,189,248,0.1)', false, false, false, false];
const DAU_TIERS = [100000, 1000000, 5000000];

/**
 * Compute total costs for all 5 game presets across 3 DAU tiers.
 * Uses each game's own architecture profile but applies the shared CUD discount.
 */
function computeAllGameCosts(cudDiscount) {
    return GAME_KEYS.map(key => {
        const preset = PRESETS[key];
        return DAU_TIERS.map(dau => calculateCosts({
            dau,
            ccuRatio: preset.ccu / 100,
            playtime: preset.playtime,
            patchSize: preset.patch,
            cudDiscount,
            presetKey: key
        }));
    });
}

const CHART_OPTS = {
    darkGrid: { color: '#1e293b' },
    tickColor: { color: '#94a3b8' },
    legendLabels: { color: '#cbd5e1', font: { size: 11 } }
};

/**
 * Create chart instances on first call. Safe to call multiple times.
 */
export function renderInfographicCharts(cudDiscount = 0.30, activePreset = 'cod', activeDau = 1000000, activeConfig = null) {
    const allResults = computeAllGameCosts(cudDiscount);

    // ── Chart 1: DAU Scaling Line Chart ──
    if (chartDau) { chartDau.destroy(); chartDau = null; }
    const el1 = document.getElementById('chart-dau-scaling');
    if (el1) {
        const datasets = GAME_KEYS.map((key, i) => {
            const isSelected = key === activePreset;
            let dataPoints;
            if (isSelected && activeConfig) {
                // If it is the selected game, dynamically compute the line based on current slider values
                dataPoints = DAU_TIERS.map(dau => {
                    const res = calculateCosts({
                        dau,
                        ccuRatio: activeConfig.ccu / 100,
                        playtime: activeConfig.playtime,
                        patchSize: activeConfig.patch,
                        cudDiscount,
                        presetKey: key
                    });
                    return Math.round(res.totalCost);
                });
            } else {
                // Otherwise use the default preset values
                dataPoints = allResults[i].map(r => Math.round(r.totalCost));
            }

            return {
                label: GAME_LABELS[i],
                data: dataPoints,
                borderColor: GAME_COLORS[i],
                backgroundColor: GAME_FILLS[i],
                fill: !!GAME_FILLS[i],
                tension: 0.3,
                pointRadius: isSelected ? 6 : 0,
                pointHoverRadius: 8,
                borderWidth: isSelected ? 4 : 2
            };
        });

        chartDau = new Chart(el1.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['100k DAU', '1M DAU', '5M DAU'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { ...CHART_OPTS.legendLabels, usePointStyle: true, pointStyle: 'line' } } },
                scales: {
                    x: { grid: CHART_OPTS.darkGrid, ticks: CHART_OPTS.tickColor },
                    y: { grid: CHART_OPTS.darkGrid, ticks: { ...CHART_OPTS.tickColor, callback: v => '$' + (v / 1000) + 'k' } }
                }
            }
        });
    }

    // ── Chart 2: Break-Even ARPU Bar Chart ──
    if (chartArpu) { chartArpu.destroy(); chartArpu = null; }
    const el2 = document.getElementById('chart-arpu-comparison');
    if (el2) {
        chartArpu = new Chart(el2.getContext('2d'), {
            type: 'bar',
            data: {
                labels: GAME_LABELS,
                datasets: [
                    {
                        label: 'Infra Break-Even ARPU ($)',
                        data: GAME_KEYS.map((key, i) => {
                            const isSelected = key === activePreset;
                            const res = (isSelected && activeConfig) ? calculateCosts({
                                dau: activeDau,
                                ccuRatio: activeConfig.ccu / 100,
                                playtime: activeConfig.playtime,
                                patchSize: activeConfig.patch,
                                cudDiscount,
                                presetKey: key
                            }) : allResults[i][0];
                            return parseFloat(res.breakEvenArpu.toFixed(2));
                        }),
                        backgroundColor: GAME_KEYS.map(key => key === activePreset ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)')
                    },
                    {
                        label: 'Target Profitable ARPU ($)',
                        data: GAME_KEYS.map((key, i) => {
                            const isSelected = key === activePreset;
                            const res = (isSelected && activeConfig) ? calculateCosts({
                                dau: activeDau,
                                ccuRatio: activeConfig.ccu / 100,
                                playtime: activeConfig.playtime,
                                patchSize: activeConfig.patch,
                                cudDiscount,
                                presetKey: key
                            }) : allResults[i][0];
                            return parseFloat(res.maxTargetArpu.toFixed(2));
                        }),
                        backgroundColor: GAME_KEYS.map(key => key === activePreset ? '#10b981' : 'rgba(16, 185, 129, 0.4)')
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: CHART_OPTS.legendLabels } },
                scales: {
                    x: { grid: CHART_OPTS.darkGrid, ticks: CHART_OPTS.tickColor },
                    y: { grid: CHART_OPTS.darkGrid, ticks: { ...CHART_OPTS.tickColor, callback: v => '$' + v } }
                }
            }
        });
    }
}

/**
 * Update charts in-place with new data (called from updateCalc on every slider change).
 * Uses Chart.js .update() for smooth, efficient re-rendering without destroying instances.
 */
export function updateChartsFromCalc(cudDiscount, activePreset = 'cod', activeDau = 1000000, activeConfig = null) {
    // If charts are not loaded, just render them initially
    if (!chartDau || !chartArpu) {
        renderInfographicCharts(cudDiscount, activePreset, activeDau, activeConfig);
        return;
    }

    const allResults = computeAllGameCosts(cudDiscount);

    // Update Chart 1: DAU Scaling
    if (chartDau) {
        GAME_KEYS.forEach((key, i) => {
            const ds = chartDau.data.datasets[i];
            const isSelected = key === activePreset;

            if (isSelected && activeConfig) {
                ds.data = DAU_TIERS.map(dau => {
                    const res = calculateCosts({
                        dau,
                        ccuRatio: activeConfig.ccu / 100,
                        playtime: activeConfig.playtime,
                        patchSize: activeConfig.patch,
                        cudDiscount,
                        presetKey: key
                    });
                    return Math.round(res.totalCost);
                });
            } else {
                ds.data = allResults[i].map(r => Math.round(r.totalCost));
            }

            ds.pointRadius = isSelected ? 6 : 0;
            ds.borderWidth = isSelected ? 4 : 2;
        });
        chartDau.update();
    }

    // Update Chart 2: ARPU Comparison
    if (chartArpu) {
        chartArpu.data.datasets[0].data = GAME_KEYS.map((key, i) => {
            const isSelected = key === activePreset;
            const res = (isSelected && activeConfig) ? calculateCosts({
                dau: activeDau,
                ccuRatio: activeConfig.ccu / 100,
                playtime: activeConfig.playtime,
                patchSize: activeConfig.patch,
                cudDiscount,
                presetKey: key
            }) : allResults[i][0];
            return parseFloat(res.breakEvenArpu.toFixed(2));
        });

        chartArpu.data.datasets[1].data = GAME_KEYS.map((key, i) => {
            const isSelected = key === activePreset;
            const res = (isSelected && activeConfig) ? calculateCosts({
                dau: activeDau,
                ccuRatio: activeConfig.ccu / 100,
                playtime: activeConfig.playtime,
                patchSize: activeConfig.patch,
                cudDiscount,
                presetKey: key
            }) : allResults[i][0];
            return parseFloat(res.maxTargetArpu.toFixed(2));
        });
        
        // Highlight active preset
        chartArpu.data.datasets[0].backgroundColor = GAME_KEYS.map(key => key === activePreset ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)');
        chartArpu.data.datasets[1].backgroundColor = GAME_KEYS.map(key => key === activePreset ? '#10b981' : 'rgba(16, 185, 129, 0.4)');
        
        chartArpu.update();
    }
}
