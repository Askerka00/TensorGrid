# TensorGrid Architecture

## System Overview

TensorGrid connects AI developers who need on-demand compute with gaming cyberclubs and workstation owners whose GPUs sit idle up to 70% of the day. All payments, escrow locks, and settlements happen on the Solana blockchain with sub-cent fees.

```
┌─────────────────┐       ┌──────────────────────────────┐       ┌───────────────────────┐
│  AI Developer / │──────▶│   TensorGrid Orchestrator    │──────▶│   Solana Blockchain   │
│  ML Pipeline    │       │   (Job Scheduler & Matcher)  │       │  (Anchor Escrow PDA)  │
└─────────────────┘       └──────────────┬───────────────┘       └───────────┬───────────┘
                                         │                                   │
                                         ▼                                   │ Real-Time
                                  ┌──────────────┐                           │ Streaming
                                  │  Node Agent  │                           │ Payouts (70/20/10)
                                  │ (Windows/Mac)│                           │
                                  └──────┬───────┘                           │
                                         │ Hardware                          ▼
                                         ▼ Input Hook             ┌──────────────────────┐
                                  ┌──────────────┐                │   Provider Wallet    │
                                  │  Kill-Switch │                │  (Phantom/Solflare)  │
                                  │   (<10ms)    │                └──────────────────────┘
                                  └──────────────┘
```

## Core Components

### 1. Solana Anchor Smart Contract (`programs/tensorgrid-protocol`)
* **`ProtocolConfig` PDA**: Stores protocol parameters, treasury address, insurance reserve pool, and fee shares (7000 bps provider, 2000 bps treasury, 1000 bps insurance).
* **`ComputeNode` PDA**: On-chain registry for hardware specifications, tier (CPU, DirectML, NVIDIA CUDA), hourly rates, and payout destination.
* **`TaskEscrow` PDA**: Locks client deposits in escrow prior to compute dispatch.
* **`settle_task`**: Verifies cryptographic Proof-of-Computation, splits reward 70/20/10, and returns unspent deposit.
* **`cancel_task`**: Automatic timeout or client-triggered full refund if a task is interrupted.

### 2. Node Agents (Zero-Lag Worker Client)
* **Windows (`agent.ps1`)**: Uses native Win32 `GetLastInputInfo` to monitor keyboard/mouse idle time down to the millisecond. Automatically starts the background compute worker when idle >15s, and invokes an instant hardware interrupt Kill-Switch (<10ms) the moment a gamer touches the mouse.
* **macOS / Linux (`agent.sh`)**: Uses `ioreg` (macOS) or `xprintidle` (Linux) with Apple Silicon Metal Performance Shaders (MPS) and CUDA detection.

### 3. Orchestrator Backend (`server/`)
* **Job Queue & Dispatcher**: Matches inbound inference requests with available idle nodes based on VRAM requirements and compute tiers.
* **Proof-of-Computation Verifier**: Validates output checksums and compute durations before generating settlement instructions.
* **WebSocket Real-Time Stream**: Live telemetry feed to web dashboard.

### 4. Web Dashboard (`web/`)
* Built with **React 18**, **Vite**, and **Tailwind CSS**.
* Live node monitoring, remote task submission, automated wallet binding, and real-time Solana Explorer transaction links.

## Economics & Revenue Split

| Recipient | Share | Purpose |
|:---|:---|:---|
| **Hardware Provider** | **70%** ($0.35/hr on $0.50 base) | Direct passive income for gaming clubs & PC owners |
| **Protocol Treasury** | **20%** ($0.10/hr) | Network relay, API endpoints, infrastructure maintenance |
| **Insurance / Slashing Pool** | **10%** ($0.05/hr) | Compensation fund for interrupted tasks & validator rewards |
