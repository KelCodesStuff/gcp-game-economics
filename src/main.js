import './style.css';
import { marked } from 'marked';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import { calculateCosts, PRESETS } from './calculator.js';
import { renderInfographicCharts, updateChartsFromCalc } from './charts.js';

// Import raw markdown and HTML files using Vite's ?raw import suffix
import arpuAnalysisMd from './reports/arpu-analysis.md?raw';
import economiesScaleMd from './reports/infrastructure-costs-decrease.md?raw';
import gcpRequirementsMd from './reports/gcp-requirements.md?raw';
import calculatorHtml from './calculator.html?raw';

import glossaryHtml from './glossary.html?raw';
import docsHtml from './docs.html?raw';

const DOCS = [
    {
        id: 'gcp-requirements',
        title: 'Architectural & Technical GCP Requirements by Game',
        icon: 'fa-server',
        content: gcpRequirementsMd
    },
    {
        id: 'arpu-analysis',
        title: 'Game Infrastructure Unit Economics & ARPU Analysis',
        icon: 'fa-scale-balanced',
        content: arpuAnalysisMd
    },
    {
        id: 'infrastructure-costs-decrease',
        title: 'Infrastructure Costs Decrease as DAU Scale Increases',
        icon: 'fa-chart-line',
        content: economiesScaleMd
    }
];

let currentActiveDoc = DOCS[0].id;

function updateCalc() {
    const dau = parseInt(document.getElementById('input-dau').value);
    const ccuRatio = parseFloat(document.getElementById('input-ccu').value) / 100;
    const playtime = parseFloat(document.getElementById('input-playtime').value);
    const patchSize = parseFloat(document.getElementById('input-patch').value);
    const cudDiscount = parseFloat(document.getElementById('input-cud').value) / 100;
    const presetKey = document.getElementById('calc-preset').value;

    const preset = PRESETS[presetKey] || PRESETS.cod;

    // Run calculations
    const res = calculateCosts({ dau, ccuRatio, playtime, patchSize, cudDiscount, presetKey });

    // UI Label updates
    document.getElementById('val-dau').innerText = dau.toLocaleString();
    document.getElementById('val-ccu').innerText = (ccuRatio * 100).toFixed(1) + '%';
    document.getElementById('calc-peak-ccu').innerText = Math.round(res.peakCCU).toLocaleString() + ' CCU';
    document.getElementById('val-playtime').innerText = playtime.toFixed(2) + ' hrs';
    document.getElementById('val-patch').innerText = patchSize + ' GB';
    document.getElementById('val-cud').innerText = (cudDiscount * 100).toFixed(0) + '% off';

    // Preset Badges
    document.getElementById('preset-bandwidth').innerText = preset.bandwidthKbps + ' Kbps';
    document.getElementById('preset-density').innerText = preset.ccuPerVcpu + ' CCU / vCPU';

    // Update HUD Cards
    document.getElementById('hud-total').innerText = '$' + Math.round(res.totalCost).toLocaleString();
    document.getElementById('hud-breakeven').innerText = '$' + res.breakEvenArpu.toFixed(2);
    document.getElementById('hud-target-arpu').innerText = '$' + res.minTargetArpu.toFixed(2) + ' - $' + res.maxTargetArpu.toFixed(2);

    // Update Proportional Progress Bars
    document.getElementById('bar-compute').style.width = res.pCompute + '%';
    document.getElementById('bar-egress').style.width = res.pEgress + '%';
    document.getElementById('bar-patch').style.width = res.pPatch + '%';
    document.getElementById('bar-db').style.width = res.pDb + '%';

    // Update Detailed Line Items Table
    const tbody = document.getElementById('table-calc-body');
    tbody.innerHTML = `
        <tr>
            <td class="py-2.5 text-white font-sans font-semibold">GKE / Agones Compute Fleet</td>
            <td class="py-2.5 text-right text-slate-400">${Math.round(res.vcpusNeeded).toLocaleString()} vCPUs</td>
            <td class="py-2.5 text-right text-white">$${Math.round(res.computeCost).toLocaleString()}</td>
            <td class="py-2.5 text-right text-white font-bold">${res.pCompute}%</td>
        </tr>
        <tr>
            <td class="py-2.5 text-white font-sans font-semibold">Gameplay Network Egress</td>
            <td class="py-2.5 text-right text-slate-400">${Math.round(res.monthlyGameplayGB / 1000).toLocaleString()} TB / mo</td>
            <td class="py-2.5 text-right text-white">$${Math.round(res.egressCost).toLocaleString()}</td>
            <td class="py-2.5 text-right text-white font-bold">${res.pEgress}%</td>
        </tr>
        <tr>
            <td class="py-2.5 text-white font-sans font-semibold">Patch CDN Egress</td>
            <td class="py-2.5 text-right text-slate-400">${Math.round(res.monthlyPatchGB / 1000).toLocaleString()} TB / mo</td>
            <td class="py-2.5 text-right text-white">$${Math.round(res.patchCost).toLocaleString()}</td>
            <td class="py-2.5 text-right text-white font-bold">${res.pPatch}%</td>
        </tr>
        <tr>
            <td class="py-2.5 text-white font-sans font-semibold">Database & Persistence Tier</td>
            <td class="py-2.5 text-right text-slate-400">Spanner/Redis Scale</td>
            <td class="py-2.5 text-right text-white">$${Math.round(res.dbCost).toLocaleString()}</td>
            <td class="py-2.5 text-right text-white font-bold">${res.pDb}%</td>
        </tr>
    `;

    // Update real-time charts based on current inputs
    updateChartsFromCalc(cudDiscount, presetKey, dau, {
        ccu: ccuRatio * 100,
        playtime: playtime,
        patch: patchSize,
        dbFactor: preset.dbFactor,
        ccuPerVcpu: preset.ccuPerVcpu
    });
}

function applyPreset() {
    const presetKey = document.getElementById('calc-preset').value;
    if (PRESETS[presetKey]) {
        const p = PRESETS[presetKey];
        document.getElementById('input-ccu').value = p.ccu;
        document.getElementById('input-playtime').value = p.playtime;
        document.getElementById('input-patch').value = p.patch;
    }
    updateCalc();
}

function setDAU(val) {
    document.getElementById('input-dau').value = val;
    updateCalc();
}

function resetCalculator() {
    document.getElementById('calc-preset').value = 'cod';
    document.getElementById('input-dau').value = 1000000;
    applyPreset();
}

function switchTab(tabId) {
    const tabs = ['calculator', 'glossary', 'docs'];

    tabs.forEach(t => {
        const section = document.getElementById('view-' + t);
        if (section) {
            section.classList.add('hidden');
        }

        // Desktop nav update using classList
        const navBtn = document.getElementById('nav-' + t);
        if (navBtn) {
            if (t === tabId) {
                navBtn.classList.remove('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/50', 'border-transparent');
                navBtn.classList.add('text-sky-400', 'bg-sky-500/10', 'border-sky-500/20');
            } else {
                navBtn.classList.add('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/50', 'border-transparent');
                navBtn.classList.remove('text-sky-400', 'bg-sky-500/10', 'border-sky-500/20');
            }
        }

        // Mobile nav update using classList
        const mNavBtn = document.getElementById('mobile-nav-' + t);
        if (mNavBtn) {
            if (t === tabId) {
                mNavBtn.classList.remove('text-slate-400');
                mNavBtn.classList.add('text-sky-400', 'font-bold', 'bg-sky-500/10');
            } else {
                mNavBtn.classList.add('text-slate-400');
                mNavBtn.classList.remove('text-sky-400', 'font-bold', 'bg-sky-500/10');
            }
        }
    });

    const activeSection = document.getElementById('view-' + tabId);
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }



    if (tabId === 'calculator') {
        updateCalc();
    }

    if (tabId === 'glossary') {
        const glossarySection = document.getElementById('view-glossary');
        if (glossarySection) {
            renderMathInElement(glossarySection, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }
}

function initDocViewer() {
    const container = document.getElementById('doc-list-container');
    if (container) {
        container.innerHTML = DOCS.map(doc => `
            <div id="doc-item-${doc.id}" onclick="loadDoc('${doc.id}')" class="p-3 rounded-xl glass-card glass-card-hover cursor-pointer border border-slate-800 transition flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-slate-800 text-sky-400 flex items-center justify-center text-sm">
                    <i class="fa-solid ${doc.icon}"></i>
                </div>
                <div class="overflow-hidden">
                    <h4 class="text-xs font-bold text-slate-200 truncate">${doc.title}</h4>
                    <span class="text-[10px] text-slate-500 block">Document</span>
                </div>
            </div>
        `).join('');
    }

    loadDoc(DOCS[0].id);
}

function loadDoc(docId) {
    currentActiveDoc = docId;
    DOCS.forEach(d => {
        const el = document.getElementById('doc-item-' + d.id);
        if (el) {
            if (d.id === docId) {
                el.className = 'p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 transition flex items-center space-x-3';
            } else {
                el.className = 'p-3 rounded-xl glass-card glass-card-hover cursor-pointer border border-slate-800 transition flex items-center space-x-3';
            }
        }
    });

    const doc = DOCS.find(d => d.id === docId);
    if (doc) {
        const rawHtml = marked.parse(doc.content);
        const contentDiv = document.getElementById('doc-content');
        if (contentDiv) {
            contentDiv.innerHTML = rawHtml;

            // Render KaTeX math equations
            renderMathInElement(contentDiv, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }
}

function filterDocs() {
    const q = document.getElementById('doc-search').value.toLowerCase();
    DOCS.forEach(d => {
        const el = document.getElementById('doc-item-' + d.id);
        if (el) {
            if (d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
}

function copyCurrentDocMarkdown() {
    const doc = DOCS.find(d => d.id === currentActiveDoc);
    if (doc) {
        navigator.clipboard.writeText(doc.content).then(() => {
            alert('Document markdown copied to clipboard!');
        });
    }
}

// Bind to window scope so index.html triggers can find them
window.switchTab = switchTab;
window.applyPreset = applyPreset;
window.setDAU = setDAU;
window.resetCalculator = resetCalculator;
window.loadDoc = loadDoc;
window.filterDocs = filterDocs;
window.copyCurrentDocMarkdown = copyCurrentDocMarkdown;
window.updateCalc = updateCalc;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    const calculatorContainer = document.getElementById('view-calculator');
    if (calculatorContainer) {
        calculatorContainer.innerHTML = calculatorHtml;
    }

    const glossaryContainer = document.getElementById('view-glossary');
    if (glossaryContainer) {
        glossaryContainer.innerHTML = glossaryHtml;
    }
    const docsContainer = document.getElementById('view-docs');
    if (docsContainer) {
        docsContainer.innerHTML = docsHtml;
    }
    updateCalc();
    initDocViewer();
});
