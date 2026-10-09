# ⚡ TensorGrid

> Decentralized DePIN compute protocol powered by the Solana blockchain, aggregating idle GPU & CPU computing power into a distributed supercluster for AI inference, deep learning, and 3D rendering.

---

## 📌 Overview

**TensorGrid** solves the dilemma of idle hardware and overpriced cloud monopolies (AWS, Azure, GCP). The protocol allows gaming centers, PC cafes, and individual workstation owners to monetize idle hardware (NVIDIA RTX 30xx/40xx/50xx, Apple Silicon Metal, AMD Radeon, and multi-core CPUs), while AI developers gain access to on-demand compute starting at **$0.50/hour** (up to 80% cheaper than traditional cloud providers).

### Key Features

* **Solana Core Payouts**: Real-time microtransactions with sub-cent fees ($0.00025). Streaming payouts in $USDC and SOL directly to your Solana wallet (Phantom, Solflare).
* **Smart Zero-Lag Detection**: Automatic background execution on system idle, and an instant **Kill-Switch (<10ms)** that frees GPU/CPU resources immediately upon user keyboard/mouse activity.
* **Universal Hardware Support**: 
  - **NVIDIA GPUs** (CUDA / TensorRT)
  - **Apple Silicon** (M1–M4 via Metal Performance Shaders & MLX)
  - **AMD Radeon** (DirectML on Windows, ROCm on Linux)
  - **CPU-Only Fallback** (llama.cpp / AVX2 quantized LLM inference)
* **Secure Sandbox**: Workloads run in isolated execution environments with zero access to host files or personal data.
* **Live Web Dashboard & REST API**: Real-time orchestration dashboard with live node metrics, automated wallet binding, and remote task dispatching.

---

## 🏗 System Architecture

```
[Compute Providers] ──► [Node Agent (Zero-Lag)] ──► [Solana Escrow] ──► [AI Developers]
        ▲                                                    │                   │
        └──────────────── Real-Time $USDC / SOL Payouts ─────┴───────────────────┘
```

| Component | Description | Tech Stack |
| :--- | :--- | :--- |
| **Smart Contract** | On-chain Escrow PDA, Proof-of-Computation, 70/20/10 revenue split | Solana, Anchor, Rust |
| **Web Dashboard** | Real-time orchestrator UI, node manager, and wallet binder | React 18, Vite, Tailwind CSS, Lucide |
| **Orchestrator** | Node heartbeat management, task scheduling, and live state | Node.js, Express, WebSocket, TypeScript |
| **Blockchain Engine** | Devnet escrow, wallet balances, and automated payout cycles | Solana Web3.js, SPL Token, @solana/web3.js |
| **Node Agents** | Hardware auto-detection, idle polling, and instant kill-switch | PowerShell (Windows), Bash (macOS / Linux) |

---

## ⛓ Solana Smart Contract (Anchor Framework)

The on-chain protocol logic is implemented in Rust using the **Anchor Framework** (`programs/tensorgrid-protocol`):

### Core Instructions

1. `initialize_protocol`: Sets up the protocol state with treasury wallet and 70/20/10 fee distribution (70% Provider / 20% Protocol / 10% Insurance).
2. `register_node`: Allows compute providers (PC clubs, workstation owners) to register hardware specs, tier, and payout wallet.
3. `create_task_escrow`: AI client deposits funds into an isolated TaskEscrow PDA before computation begins.
4. `settle_task`: Verifies cryptographic Proof-of-Computation hash, distributes 70/20/10 rewards, and refunds unspent deposit.
5. `cancel_task`: Refunds 100% of escrowed funds back to the client if the task times out or is cancelled.

### Build & Test Contracts

```bash
# Build Anchor Solana program
anchor build

# Run TypeScript integration test suite
anchor test
```

---

## 💰 Economics ($0.50 / hour benchmark for RTX 4080)

* **70% ($0.35/hr)**: Direct payout to the hardware provider.
* **20% ($0.10/hr)**: Protocol treasury, network routing, and infrastructure scaling.
* **10% ($0.05/hr)**: Slashing insurance pool and validator consensus rewards.

---

## 🚀 Quick Start Guide

### 1. Launch the Orchestrator & Dashboard

```bash
# Clone the repository
git clone https://github.com/Askerka00/TensorGrid.git
cd TensorGrid

# Install dependencies
npm run install:all

# Start orchestrator and dashboard locally
npm run dev
```

* **Web Dashboard**: `http://localhost:5173`
* **Orchestrator API**: `http://localhost:4000`

---

### 2. Connect a Worker Node (1-Click Run)

You can connect any PC or server to the network using the pre-configured 1-click commands:

#### 🪟 Windows (NVIDIA CUDA / AMD / CPU)
Run PowerShell as Administrator:
```powershell
irm https://tensorgrid.vercel.app/agent.ps1 | iex
```
*Custom Wallet Example:*
```powershell
& ([scriptblock]::Create((irm https://tensorgrid.vercel.app/agent.ps1))) -Wallet "YOUR_SOLANA_WALLET_ADDRESS"
```

#### 🍏 macOS (Apple Silicon M1/M2/M3/M4 Metal)
Open Terminal and run:
```bash
curl -sSL https://tensorgrid.vercel.app/agent.sh | bash -s -- "YOUR_SOLANA_WALLET_ADDRESS"
```

#### 🐧 Linux (CUDA / ROCm / CPU)
```bash
curl -sSL https://tensorgrid.vercel.app/agent.sh | bash -s -- "YOUR_SOLANA_WALLET_ADDRESS"
```

---

## 🗺 Roadmap

- [x] Protocol concept and architecture specification
- [x] Orchestrator REST API with real-time heartbeat tracking
- [x] Zero-Lag Node Agent for Windows (PowerShell Win32 API Hook)
- [x] Zero-Lag Node Agent for macOS (Metal MPS) & Linux (CUDA/ROCm)
- [x] Live React web dashboard with Solana Devnet payouts
- [x] Production cloud deployment on Vercel
- [ ] Solana Mainnet smart contract deployment (Anchor)
- [ ] Containerized Docker / WASM sandbox executor
- [ ] Solana Blinks & Actions for 1-click mobile earnings tracking

---

## 📄 License

MIT License © 2026 TensorGrid Protocol
