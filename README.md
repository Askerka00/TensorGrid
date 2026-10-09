# TensorGrid — Decentralized GPU Compute Network

[![CI](https://github.com/Askerka00/TensorGrid/actions/workflows/ci.yml/badge.svg)](https://github.com/Askerka00/TensorGrid/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-14F195.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-devnet-9945FF)](https://solana.com)
[![Hackathon](https://img.shields.io/badge/Colosseum-2026-14F195)](https://colosseum.org)

> Decentralized DePIN compute protocol on Solana — turns idle gaming PCs, cybercafes, and workstations into a distributed AI supercluster, cutting compute costs by up to 85% with real-time streaming micro-payouts.

[Live Demo](https://tensorgrid.vercel.app) · [Video Walkthrough](https://tensorgrid.vercel.app) · [Docs](docs/) · [Colosseum Submission](https://tensorgrid.vercel.app)

---

## Submission to 2026 Solana Hackathon

| Name | Role | Contact |
|:---|:---|:---|
| Asker Aubakirov | Founder & Lead Protocol Engineer | [GitHub](https://github.com/Askerka00) · [Telegram](https://t.me/askerka) · [X](https://x.com/askerka00) |

---

## Problem and Solution

### 1. Idle Hardware & Stranded Capital
- **Problem:** Cybercafes and high-end PC owners experience 60-70% downtime (nights 02:00–10:00 and weekday mornings), generating $0 revenue on depreciating $2,000+ RTX 4080/5080 GPUs.
- **TensorGrid:** Automated background node agent monetizes idle downtime, earning $150–$250+ per month per machine without human intervention.

### 2. Cloud Monopolies & GPU Scarcity
- **Problem:** Centralized clouds (AWS, Azure, GCP) charge $3.00–$6.00/hour per GPU with multi-week waitlists for compute allocations.
- **TensorGrid:** Decentralized consumer GPU sharing slashes compute rates to **$0.50/hour** (up to 85% savings for AI startups and developers).

### 3. Zero-Lag Gamer Protection
- **Problem:** Sharing gaming hardware cannot compromise client experience; any latency or VRAM lock causes immediate customer churn for clubs.
- **TensorGrid:** Instant Win32 hardware input hook (<10ms Kill-Switch) immediately terminates background compute and purges VRAM the instant a gamer moves the mouse.

### 4. Trustless Micro-Payouts
- **Problem:** Web2 monthly settlement cycles create high counterparty risk and large payout thresholds.
- **TensorGrid:** Solana Anchor Escrow streams $USDC and SOL every 10–30 seconds with $0.00025 transaction fees based on cryptographic Proof-of-Computation.

---

## Why Solana

- **Speed** — 400 ms block times enable real-time streaming micro-payouts directly to hardware providers every few seconds.
- **Cost** — $0.00025 per transaction makes high-frequency escrow settlements economically viable.
- **Ecosystem** — Direct composability with Solana DeFi and DePIN ecosystems.
- **Solana Blinks & Actions** — 1-click node monitoring and one-tap wallet withdrawals directly inside Telegram and X.

---

## Summary of Features

- 1-Click Zero-Lag Node Agent for Windows, macOS (Apple Silicon Metal), and Linux (CUDA/ROCm)
- On-chain Anchor Escrow PDA with 70/20/10 revenue distribution (70% Provider / 20% Treasury / 10% Insurance)
- Hardware auto-detection (NVIDIA RTX, AMD Radeon, Apple Silicon MPS, Multi-Core CPU fallback)
- Cryptographic Proof-of-Computation verification
- Live React 18 + Vite dashboard with real-time heartbeat and Solana Explorer transaction links
- OpenAI & PyTorch compatible API for seamless task submission

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **On-Chain Program** | Rust · Anchor Framework · Solana Web3 |
| **Backend & Orchestrator** | Node.js · Express · WebSocket · TypeScript |
| **Frontend Dashboard** | React 18 · Vite · Tailwind CSS · Lucide Icons |
| **Node Agents** | PowerShell (Windows Win32 API) · Bash (macOS / Linux) |
| **Testing & CI** | Anchor Test Suite · Mocha · Chai · GitHub Actions |

---

## Architecture

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

See [docs/architecture.md](docs/architecture.md) for full technical breakdown.

---

## Quick Start

**Prerequisites:** Node.js 18+, Rust, Anchor CLI, Solana CLI

```bash
# 1. Clone the repository
git clone https://github.com/Askerka00/TensorGrid.git
cd TensorGrid

# 2. Install dependencies
npm run install:all

# 3. Copy environment variables
cp .env.example .env

# 4. Build Solana Anchor smart contracts
anchor build

# 5. Run smart contract test suite
anchor test

# 6. Start local orchestrator & dashboard
npm run dev
```

---

## Connect a Worker Node (1-Click Run)

### 🪟 Windows (NVIDIA CUDA / AMD / CPU)
Run PowerShell as Administrator:
```powershell
irm https://tensorgrid.vercel.app/agent.ps1 | iex
```

### 🍏 macOS (Apple Silicon M1/M2/M3/M4 Metal)
Open Terminal and run:
```bash
curl -sSL https://tensorgrid.vercel.app/agent.sh | bash -s -- "YOUR_SOLANA_WALLET_ADDRESS"
```

### 🐧 Linux (CUDA / ROCm / CPU)
```bash
curl -sSL https://tensorgrid.vercel.app/agent.sh | bash -s -- "YOUR_SOLANA_WALLET_ADDRESS"
```

---

## Roadmap

- [x] On-chain Solana Anchor Smart Contract (`programs/tensorgrid-protocol`)
- [x] Task Escrow PDA & 70/20/10 revenue split settlement
- [x] Windows Zero-Lag Node Agent (`agent.ps1`) with Win32 input hook
- [x] macOS / Linux Node Agent (`agent.sh`) with Apple Silicon Metal & CUDA support
- [x] Real-time Node Orchestrator with WebSocket & REST API
- [x] Live React 18 + Vite Dashboard deployed on Vercel
- [x] Solana Devnet automated streaming payouts & transaction history
- [ ] Solana Mainnet-Beta deployment
- [ ] Integration with SmartShell, SENET, and Gizmo cyberclub APIs
- [ ] PyTorch & Ollama containerized Docker sandbox runtime

Full roadmap: [docs/roadmap.md](docs/roadmap.md)

---

## Resources

- [Live Dashboard](https://tensorgrid.vercel.app)
- [Video Demo Walkthrough](https://tensorgrid.vercel.app)
- [Architecture Documentation](docs/architecture.md)
- [Solana Smart Contract](programs/tensorgrid-protocol)

---

## License

MIT — see [LICENSE](LICENSE)
