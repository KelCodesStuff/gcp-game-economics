# GCP Game Infrastructure Cost Calculator: Architectural Overview & Development Guide

The **GCP Game Infrastructure Cost Calculator** is an interactive web tool engineered for game architects, DevOps leads, and financial planners. It models and predicts cloud infrastructure expenditures on Google Cloud Platform (GCP) across major game archetypes and player scales.

---

## 1. Tool Overview & Purpose

Estimating cloud costs for live-service multiplayer games is inherently complex because game infrastructure scales across multiple non-linear, interdependent dimensions:

* **Compute Fleet ($\text{vCPUs}/\text{RAM}$):** Scaled by peak concurrent users ($\text{Peak CCU}$), target simulation tick rates ($\text{Hz}$), server instance density, and safety buffer allocations.
* **Network Gameplay Egress:** Driven by continuous per-player network bandwidth ($\text{KB/s}$) during gameplay and average daily session durations per user.
* **CDN Patch Distribution:** Dependent on monthly game update payload sizes ($\text{GB}$) downloaded by the active player base.
* **Database & State Persistence:** Driven by real-time transactional throughput (inventories, matchmaking queues, global state persistence, anti-duplication locks, and leaderboards).

This tool abstracts these multi-variable cloud pricing vectors into interactive UI controls, pre-configured game archetypes, and dynamic visual feedback loops. It enables engineering and finance teams to project monthly operating expenditures ($\text{OpEx}$) for populations ranging from $100{,}000$ to over $5{,}000{,}000$ Daily Active Users ($\text{DAU}$).

---

## 2. System Architecture & Technical Stack

The calculator is constructed using a decoupled, reactive component architecture designed for zero-latency UI re-rendering upon parameter adjustments.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          User Input Controls                             │
│   (DAU, Architecture Preset, CCU %, Playtime, Patch Size, CUD Discount)  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         Reactive State Store                             │
│           (Proxy Engine & Observer Subscription Pipeline)               │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      Cost Model Calculation Engine                       │
│             Compute + Game Egress + CDN Patching + Database              │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Editorial HUD  │         │ Stacked Bar &   │         │  Data Table UI  │
│  Summary Cards  │         │ Chart Rendering │         │ Cost Breakdown  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Technical Stack Components
* **Reactive State Engine:** A Proxy-based reactivity system that stores parameters (`dau`, `preset`, `ccuRatio`, `playtime`, `patchSize`, `cud`) and publishes change events to subscribed observers.
* **Mathematical Computation Engine:** A pure functional pipeline that processes raw inputs, executes domain equations, applies pricing tiers, and returns aggregated dollar figures and unit metrics.
* **Visualization Engine:** Dynamic UI components that render horizontal stacked bar charts and unit metric cards to show proportional spending across infrastructure vectors.
* **Data Grid Layer:** An interactive financial ledger detailing line-item spending, absolute values, and percentage allocations.

---

## 3. How the Tool Was Created: Step-by-Step Process

The development process followed five structured phases:

### Phase 1: Mathematical Domain Profiling
We analyzed five major multiplayer game genres to establish baseline engineering parameters. For each genre, we defined:
* Average gameplay network bandwidth ($\text{KB/s}$).
* Server instance density ($\text{CCU / vCPU}$).
* Database transactional weight factors (reads/writes per player session).

### Phase 2: Reactive State Architecture
We built a state management store to encapsulate all user inputs and pricing constants:
* `dau`: Daily Active Users (range: $10{,}000$ to $10{,}000{,}000$).
* `ccuRatio`: Ratio of Peak Concurrent Users to DAU (default: $10\%$).
* `playtime`: Average daily hours played per active user.
* `patchSize`: Monthly content patch download payload per user ($\text{GB}$).
* `cud`: GCP 3-Year Committed Use Discount percentage ($0\%$ to $50\%$).

### Phase 3: Calculation Engine Pipeline Implementation
The pipeline transforms user inputs into precise monthly spending estimates:
1. Calculates Peak CCU from total DAU and the CCU ratio.
2. Models Compute Fleet Costs using GCP Compute Engine standard node pricing ($\$0.0475$ per vCPU-hour across $730$ average monthly hours), applying Committed Use Discounts (CUDs).
3. Computes Gameplay Egress based on data throughput rates and session durations.
4. Calculates CDN Distribution Costs for patch payload delivery across all active users.
5. Models Database & Storage Costs by scaling instance requirements according to operational complexity factors.

### Phase 4: UI & Data Visualization Layer
We developed three complementary display components:
* **Editorial Metric HUD:** Displays high-level KPIs including Total Monthly Spend, Cost per DAU, and Cost per Peak CCU.
* **Visual Breakdown Bar:** Renders color-coded proportional bars for Compute, Network Egress, CDN Patching, and Database costs.
* **Detailed Line-Item Table:** Displays raw monetary figures and percentage contributions for financial auditing.

### Phase 5: Event Observers & Binding
Observers were attached to the state store. Any input modification (e.g., sliding DAU from $100{,}000$ to $1{,}000{,}000$) triggers a synchronous pass through the calculation pipeline, updating all UI components without requiring page reloads.
