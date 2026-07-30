# Infrastructure Costs Decrease as DAU Scale Increases

The decrease in per-player spend (Infrastructure Break-Even $\text{ARPU}$) as the total player base grows from $100{,}000$ to $5{,}000{,}000$ Daily Active Users ($\text{DAU}$) is driven by **economies of scale** and **fixed-cost amortization**.

> ### Core Concept: Fixed vs. Variable Costs at Scale
> 
> In cloud architecture, total monthly infrastructure costs are composed of fixed baseline costs and variable usage costs:
> 
> $$\text{Total Cost} = \text{Fixed Overhead} + (\text{Variable Cost per User} \times \text{DAU})$$
> 
> Dividing both sides by $\text{DAU}$ gives the per-player cost:
> 
> $$\text{Infra Break-Even ARPU} = \frac{\text{Fixed Overhead}}{\text{DAU}} + \text{Variable Cost per User}$$
> 
> As $\text{DAU}$ grows, the per-player share of fixed overhead ($\frac{\text{Fixed Overhead}}{\text{DAU}}$) drops toward zero, while bulk discounts reduce the $\text{Variable Cost per User}$.

## The Four Core Drivers of Infrastructure Economies of Scale

### Tiered Volume Discounts on Network Egress & CDN
Network bandwidth and CDN patching are among the largest expense items for online games. Cloud providers like GCP use tiered pricing models where unit costs drop significantly as transfer volumes cross enterprise thresholds:
* **100k DAU Tier (~Terabyte Scale):** Egress costs start at standard list rates (typically $\$0.08$ to $\$0.12$ per $\text{GB}$).
* **5M DAU Tier (~Petabyte Scale):** At tens or hundreds of petabytes per month, custom enterprise contracts and high-volume pricing reduce network egress rates down to $\$0.02$ to $\$0.04$ per $\text{GB}$, representing a $50\% - 70\%$ reduction in variable bandwidth costs.

### Amortization of Base Database & Backend Overhead
Core backend services have baseline operational costs that exist regardless of whether $10{,}000$ or $1{,}000{,}000$ players are online:
* **Database Provisioning (Cloud Spanner / AlloyDB):** Production database clusters require a minimum number of dedicated nodes or processing units to maintain high availability, multi-region replication, and failover capabilities.
* **Core Microservices:** Global matchmakers, login authentication gates, anti-cheat orchestrators, and analytics pipelines require baseline server instances running $24/7$.
* **Impact:** At $100{,}000\text{ DAU}$, a $\$10{,}000/\text{month}$ database base overhead costs $\$0.10$ per user/month. At $5{,}000{,}000\text{ DAU}$, that same base overhead costs $\$0.002$ per user/month.

### Improved Compute Density & Headroom Buffer Smoothing
Game servers must allocate "headroom buffers"—extra warm server instances ready to handle sudden traffic spikes during regional peak hours.
* **Small Scale (100k DAU):** Regional player traffic is erratic. To prevent login queues or game creation failures, studios must keep a higher safety buffer percentage (e.g., $25\% - 30\%$ warm idle capacity).
* **Large Scale (5M DAU):** According to the Law of Large Numbers, player behavior becomes statistically smooth and predictable across global time zones. As a result, the required safety buffer percentage can be reduced to $5\% - 10\%$. Furthermore, tools like Kubernetes (GKE) and Agones achieve better bin-packing efficiency on larger node pools, ensuring fewer vCPU cores sit idle.

### GCP Committed Use Discounts (CUDs)
* **At 100,000 DAU:** Player traffic fluctuated enough that a significant portion of server compute must be purchased at higher On-Demand rates.
* **At 5,000,000 DAU:** The game establishes a massive, highly predictable baseline of continuous $24/7$ compute and database usage. Engineering leadership can lock in 3-year GCP Committed Use Discounts (CUDs) for this baseline, unlocking $30\%$ to $50\%$ off standard VM and database pricing.

## Summary Comparison Matrix

| Infrastructure Vector | 100,000 DAU Behavior | 5,000,000 DAU Behavior | Cost Scaling Effect |
| --- | --- | --- | --- |
| **Network Egress Pricing** | Standard List Rates ($\approx \$0.08/\text{GB}$) | Tiered Petabyte Discount ($\approx \$0.03/\text{GB}$) | $\sim 60\%$ lower cost per GB |
| **Database Base Overhead** | Divided among fewer players | Spread across millions of players | $\sim 98\%$ lower overhead share per player |
| **GKE Safety Buffer** | $25\% - 30\%$ idle capacity required | $5\% - 10\%$ idle capacity required | Higher vCPU core utilization |
| **GCP Pricing Model** | Heavy reliance on On-Demand pricing | Max Commitment Discounts ($3\text{-Yr CUDs}$) | $30\% - 50\%$ lower compute unit cost |

## Why Cloud Providers Benefit from Giving 50% – 70% Discounts

It may seem counterintuitive for cloud hyper-scalers (Google Cloud, AWS, Azure) to slash rates by more than half, but this strategy aligns directly with their underlying financial and operational business models:

### Capital Expenditure (CapEx) Amortization & Capacity Planning
Hyper-scalers invest tens of billions of dollars annually building data centers, laying undersea dark fiber cables, and buying server racks. A server instance sitting completely idle produces $\$0$ revenue while still incurring physical depreciation (servers are typically amortized over a 3- to 5-year lifecycle), power costs, and maintenance overhead.
* Offering a $50\%$ discount on a 3-year Committed Use Discount (CUD) guarantees continuous revenue that covers the hardware's fixed capital cost.
* Predictable commitment models give cloud providers precise forecasting data, preventing them from over-purchasing physical servers or leaving capacity stranded.

### High-Margin Upselling Ecosystems
Cloud infrastructure follows a "razor-and-blade" business model:
* Raw Compute (VMs) and Network Egress are commoditized baseline services with lower margins. Slashing compute costs acts as a customer acquisition or retention lever.
* Once a studio commits its game servers to GCP, it integrates higher-margin managed proprietary services, such as Cloud Spanner, BigQuery analytics pipelines, Vertex AI telemetry, and Google Cloud Armor DDoS protection.

### Customer Lock-In & Astronomical Switching Costs
Migrating a massive multiplayer live-service game (e.g., moving $5{,}000{,}000$ daily active users, petabytes of player profiles, and global matchmaking infrastructure) to a competitor like AWS or Azure requires months of engineering effort, risk of downtime, and multi-million dollar migration costs.
* By offering enterprise discounts ($50\% - 70\%$), cloud providers lock studios into 1- to 3-year contracts (Enterprise Discount Programs / EDPs).
* The cost for a game studio to switch providers far outweighs the small margin gain they might find elsewhere.

### Near-Zero Marginal Cost of Bandwidth at Scale
The initial cost to lay transatlantic fiber or establish an edge Point of Presence (PoP) is immense. However, once that physical infrastructure is operational, the marginal cost of transmitting one additional Terabyte of data across Google's private global fiber network is fractionally small.
* Charging an enterprise client $\$0.025/\text{GB}$ instead of $\$0.08/\text{GB}$ (a $68\%$ discount) remains profitable for Google because their internal cost per GB at petabyte scale drops to fractions of a cent.

## How Often Do These 50% – 70% Discounts Happen?

These steep discounts are not rare exceptions; they are standard operating practice across the cloud industry, structured into distinct operational tiers:

| Tier | Frequency / Coverage |
| --- | --- |
| **Standard Published Volume Tiers** | Happens Automatically ($100\%$) |
| **1-Yr to 3-Yr Committed Use (CUDs)** | Standard Business Practice ($>90\%$) |
| **Custom Enterprise Agreements** | Negotiated at Scale ($> \$500\text{k}/\text{yr}$) |
| **Preemptible / Spot Instances** | Continuous Spot Availability ($\sim 80\%$) |

### Compute Commitment Discounts (30% – 55% Off List Rates)
* **Frequency:** Nearly $100\%$ of established live-service games.
* **Mechanism:** Almost no mid-size or enterprise game operates $100\%$ on On-Demand pricing. Any studio running a title for more than a few months locks in 1-year or 3-year CUDs (GCP) or Reserved Instances / Savings Plans (AWS).
* **Trigger:** Committing to a predictable baseline vCPU/RAM footprint.

### Bandwidth & CDN Enterprise Contracts (50% – 70% Off List Rates)
* **Frequency:** Standard for high-scale games ($1\text{M}+$ DAU or $>500\text{ TB}/\text{month}$).
* **Mechanism:** Standard GCP public tiers automatically discount egress down to $\$0.08 - $\$0.05/\text{GB}$. Once total annual cloud spend crosses roughly $\$500{,}000$ to $\$1{,}000{,}000$ per year, cloud providers assign a direct Enterprise Sales team.
* **Trigger:** Custom enterprise pricing agreements (GCP EDP / AWS Private Pricing Agreements) routinely grant custom flat egress rates between $\$0.02$ and $\$0.035/\text{GB}$.

### Preemptible / Spot Instances (60% – 90% Off List Rates)
* **Frequency:** Continuous and available on-demand.
* **Mechanism:** Cloud providers sell excess, unused data center capacity at up to $90\%$ off standard prices, with the caveat that the VM can be reclaimed with 30 seconds notice.
* **Use Case in Gaming:** Game studios use Spot/Preemptible instances heavily for non-critical workloads, such as offline match replay rendering, internal CI/CD pipelines, automated QA bots, and batch data processing.
