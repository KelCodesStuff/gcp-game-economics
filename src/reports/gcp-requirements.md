# Architectural & Technical GCP Requirements by Game

Different multiplayer game genres and architectures require specifically tailored GCP services, topologies, compute instance profiles, databases, and network tiering.

## Call of Duty (Fast-Paced FPS / Warzone)

* **Topology:** Authoritative dedicated game servers running high tick rates (60 Hz to 120 Hz).
* **Compute & Orchestration:** Google Kubernetes Engine (GKE) running Agones (open-source game server management). Uses Compute-Optimized instances (`c2-standard-8` or `c3-standard-8`) for low frame timing jitter.
* **Networking:** GCP Premium Network Tier using Global External Passthrough Network Load Balancers to route traffic via Google's backbone PoPs for ultra-low latency (< 30-50ms).
* **Databases & Backends:** Cloud Spanner for multi-region player profiles, weapon loadouts, and Battle Pass states; Open Match on GKE for matchmaking; Memorystore (Redis) for active session tracking.
* **CDN & Patching:** Cloud Storage + Cloud CDN for multi-gigabyte game updates and shaders.

---

## Destiny 2 (Hybrid Action-RPG / Shooter)

* **Topology:** Custom hybrid model combining host-authoritative state/physics servers ("Bubble Hosts" and "Activity Hosts") with P2P mesh for player input/movement sync.
* **Compute & Orchestration:** GKE hosting state orchestration pods on balanced compute instances (`n2-standard-8` or `c2d-standard-8`).
* **Databases & Backends:** Heavily relies on Cloud Spanner for high-throughput transactional integrity (inventory, weapon perks, triumphs, vault storage) to prevent item loss during instance migration.
* **Networking:** UDP session relay servers deployed near player population centers via GCP edge locations.

---

## World of Warcraft (Persistent World MMORPG)

* **Topology:** Continuous spatial world servers ("Realms", "Shards", and "Phases") with long-lived TCP/UDP connections.
* **Compute & Orchestration:** High-memory and high-frequency single-core VM instances (`n2-highmem-16` or `c3-highmem-8`) running continuous spatial loop simulations.
* **Databases & Backends:** Multi-region Cloud Spanner or AlloyDB for PostgreSQL for ACID-compliant transactions (Auction House, guild banks, mail system, character persistence), paired with large Memorystore (Redis) clusters for active world routing.
* **Storage:** High IOPS Persistent Disks (`pd-ssd` or Extreme PD) for real-time state logging.

---

## Diablo IV (Semi-Open World ARPG)

* **Topology:** Seamless open-world sanctuary zones combined with dynamically spawned 4-player dungeon instances.
* **Compute & Orchestration:** Dynamic container allocation via Agones on GKE, scaling compute pods up and down based on dungeon generation requests (`c2d-standard-8` nodes).
* **Databases & Backends:** Cloud Spanner is critical here to handle cross-progression, global trade, and stash persistence while strictly enforcing anti-duplication transaction locks.
* **CDN & Patching:** High Cloud CDN utilization during seasonal content rollouts.

---

## Street Fighter 6 (1v1 Fighting Game + Battle Hub)

* **Topology:** Peer-to-Peer (P2P) direct UDP connections for 1v1 fights using Rollback Netcode (GGPO). Server infrastructure handles 3D virtual lobbies (Battle Hub), matchmaking, and ranked ladders.
* **Compute & Orchestration:** GKE hosting Battle Hub 3D room instances (~100 players per virtual lobby instance) and matchmaking microservices. Compute footprint is light compared to FPS games.
* **Databases & Backends:** AlloyDB for PostgreSQL or Cloud SQL for matchmaking queues, ranked ratings (MR/LP), cosmetics, and battle pass data.
