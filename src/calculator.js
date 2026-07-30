// PRESETS CONFIGURATION
export const PRESETS = {
    cod: { name: 'Call of Duty (FPS)', ccu: 10, playtime: 1.5, patch: 15, bandwidthKbps: 200, ccuPerVcpu: 12, dbFactor: 2.5 },
    destiny: { name: 'Destiny 2 (Action-RPG)', ccu: 10, playtime: 1.5, patch: 10, bandwidthKbps: 80, ccuPerVcpu: 40, dbFactor: 1.2 },
    wow: { name: 'World of Warcraft (MMO)', ccu: 10, playtime: 2.5, patch: 5, bandwidthKbps: 40, ccuPerVcpu: 150, dbFactor: 6.0 },
    diablo: { name: 'Diablo IV (ARPG)', ccu: 10, playtime: 1.5, patch: 12, bandwidthKbps: 120, ccuPerVcpu: 30, dbFactor: 1.8 },
    sf6: { name: 'Street Fighter 6 (P2P)', ccu: 10, playtime: 1.0, patch: 5, bandwidthKbps: 15, ccuPerVcpu: 800, dbFactor: 0.4 }
};

/**
 * Pure calculation engine for GCP Game Economics
 */
export function calculateCosts({ dau, ccuRatio, playtime, patchSize, cudDiscount, presetKey }) {
    const preset = PRESETS[presetKey] || PRESETS.cod;

    const peakCCU = Math.round(dau * ccuRatio);

    // 1. Compute
    const vcpusNeeded = peakCCU / preset.ccuPerVcpu;
    const rawComputeCost = vcpusNeeded * 0.0475 * 730;
    const computeCost = rawComputeCost * (1 - cudDiscount);

    // 2. Gameplay Egress (Non-linear tiered bandwidth pricing)
    const gbPerHourUser = (preset.bandwidthKbps * 3600) / (1024 * 1024);
    const monthlyGameplayGB = peakCCU * gbPerHourUser * playtime * 30.4;
    
    // Tiered pricing: < 100k DAU ($0.08), 100k-1M DAU ($0.06), > 1M DAU ($0.045)
    let egressRate = 0.08;
    if (dau > 1000000) {
        egressRate = 0.045;
    } else if (dau > 100000) {
        egressRate = 0.06;
    }
    const egressCost = monthlyGameplayGB * egressRate;

    // 3. Patch CDN (Interconnect discount at higher volume)
    const monthlyPatchGB = dau * patchSize;
    let patchRate = 0.04;
    if (dau > 500000) {
        patchRate = 0.025; // Direct CDN Interconnect savings
    }
    const patchCost = monthlyPatchGB * patchRate;

    // 4. Database (Logarithmic player capacity scaling)
    // Scale factor models diminishing cost-per-user database overhead: dbCost proportional to (dau ^ 0.9)
    const dbCost = (Math.pow(dau / 1000, 0.9) * preset.dbFactor * 0.12) + (peakCCU * 0.01);

    const totalCost = computeCost + egressCost + patchCost + dbCost;
    const breakEvenArpu = totalCost / dau;
    const minTargetArpu = breakEvenArpu / 0.15;
    const maxTargetArpu = breakEvenArpu / 0.10;

    const pCompute = totalCost > 0 ? ((computeCost / totalCost) * 100).toFixed(1) : 0;
    const pEgress = totalCost > 0 ? ((egressCost / totalCost) * 100).toFixed(1) : 0;
    const pPatch = totalCost > 0 ? ((patchCost / totalCost) * 100).toFixed(1) : 0;
    const pDb = totalCost > 0 ? ((dbCost / totalCost) * 100).toFixed(1) : 0;

    return {
        peakCCU,
        vcpusNeeded,
        computeCost,
        monthlyGameplayGB,
        egressCost,
        monthlyPatchGB,
        patchCost,
        dbCost,
        totalCost,
        breakEvenArpu,
        minTargetArpu,
        maxTargetArpu,
        pCompute,
        pEgress,
        pPatch,
        pDb
    };
}
