# Game Infrastructure Unit Economics & ARPU Analysis

When evaluating cloud infrastructure budgets on Google Cloud Platform (GCP), understanding **Average Revenue Per User (ARPU)** requires looking at two distinct metrics:

* **Infrastructure Break-Even ARPU (Infra Cost / DAU):** The minimum monthly revenue required from every Daily Active User purely to pay for GCP servers, network egress, databases, and CDN patching.
* **Industry Target ARPU:** The typical gross monthly revenue generated per DAU for games within each respective genre.

> ### Core Metric: Infrastructure Break-Even ARPU
> 
> $$\text{Infrastructure Break-Even ARPU} = \frac{\text{Total Monthly GCP Cost}}{\text{Daily Active Users (DAU)}}$$

> ### Target Profitable ARPU Calculation
> 
> Assuming infrastructure represents **10% to 15%** of gross live-service revenue:
> 
> $$\text{Target Profitable ARPU} = \frac{\text{Infra Break-Even ARPU}}{\text{Target Infra Share (10\\% - 15\\%)}}$$

---

## Unit Economics & ARPU Comparison Matrix

| Game Title | Scale Tier (DAU) | Monthly GCP Cost | Infra Break-Even ARPU | Typical Industry ARPU | Infra Cost as % of Target |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **Call of Duty** | **100,000** | $105,406 | **$1.05** | $3.50 - $6.50 | 16.2% - 30.0% |
| *(Fast-Paced FPS)* | **1,000,000** | $1,054,059 | **$1.05** | $3.50 - $6.50 | 16.2% - 30.0% |
| | **5,000,000** | $5,270,296 | **$1.05** | $3.50 - $6.50 | 16.2% - 30.0% |
| **Diablo IV** | **100,000** | $71,242 | **$0.71** | $2.50 - $5.50 | 12.9% - 28.4% |
| *(Seamless ARPG)* | **1,000,000** | $712,417 | **$0.71** | $2.50 - $5.50 | 12.9% - 28.4% |
| | **5,000,000** | $3,562,087 | **$0.71** | $2.50 - $5.50 | 12.9% - 28.4% |
| **Destiny 2** | **100,000** | $56,202 | **$0.56** | $3.00 - $7.50 | 7.5% - 18.7% |
| *(Hybrid Action-RPG)* | **1,000,000** | $562,021 | **$0.56** | $3.00 - $7.50 | 7.5% - 18.7% |
| | **5,000,000** | $2,810,103 | **$0.56** | $3.00 - $7.50 | 7.5% - 18.7% |
| **World of Warcraft** | **100,000** | $30,140 | **$0.30** | $12.00 - $18.00 | 1.7% - 2.5% |
| *(Persistent MMORPG)* | **1,000,000** | $301,398 | **$0.30** | $12.00 - $18.00 | 1.7% - 2.5% |
| | **5,000,000** | $1,506,989 | **$0.30** | $12.00 - $18.00 | 1.7% - 2.5% |
| **Street Fighter 6** | **100,000** | $21,661 | **$0.22** | $1.50 - $3.50 | 6.3% - 14.7% |
| *(P2P Fighter)* | **1,000,000** | $216,606 | **$0.22** | $1.50 - $3.50 | 6.3% - 14.7% |
| | **5,000,000** | $1,083,032 | **$0.22** | $1.50 - $3.50 | 6.3% - 14.7% |
