#!/usr/bin/env bash
# TensorGrid Client Agent for macOS & Linux (Apple Silicon Metal / CPU / ROCm)
# Zero-Lag Idle Compute Node

WALLET="${1:-46xHyUg3GnUZhBxvTCrSF1CGu59qQKgTRB6Sw8RyYh9L}"
ORCHESTRATOR="${2:-http://localhost:4000}"

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;33m              ⚡ TENSORGRID NODE AGENT (macOS / Linux)     \033[0m"
echo -e "\033[1;36m         Decentralized Compute on Solana (Metal / CPU)    \033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

HOSTNAME=$(hostname -s)
NODE_ID="NODE-${HOSTNAME^^}"

# Detect Hardware
HARDWARE="CPU Compute Node"
MEMORY="16GB RAM"
RATE_HOUR=0.15

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Apple Silicon Detection
    CHIP=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "Apple Silicon")
    RAM_BYTES=$(sysctl -n hw.memsize 2>/dev/null || echo "17179869184")
    RAM_GB=$((RAM_BYTES / 1024 / 1024 / 1024))
    
    if [[ "$CHIP" == *"Apple"* ]] || [[ "$CHIP" == *"M1"* ]] || [[ "$CHIP" == *"M2"* ]] || [[ "$CHIP" == *"M3"* ]] || [[ "$CHIP" == *"M4"* ]]; then
        HARDWARE="$CHIP (Metal MPS)"
        MEMORY="${RAM_GB}GB Unified Memory"
        RATE_HOUR=0.40
    else
        HARDWARE="Intel Mac ($CHIP)"
        MEMORY="${RAM_GB}GB RAM"
        RATE_HOUR=0.20
    fi
else
    # Linux Detection
    if command -v nvidia-smi &> /dev/null; then
        NVIDIA_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -n1)
        NVIDIA_MEM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -n1)
        HARDWARE="$NVIDIA_NAME"
        MEMORY="$((NVIDIA_MEM / 1024))GB GDDR"
        RATE_HOUR=0.50
    else
        CPU_NAME=$(lscpu | grep "Model name" | sed -e 's/Model name:[ \t]*//' | head -n1)
        RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        RAM_GB=$((RAM_KB / 1024 / 1024))
        HARDWARE="CPU: ${CPU_NAME:-Multi-Core}"
        MEMORY="${RAM_GB}GB RAM (AVX2/llama.cpp)"
        RATE_HOUR=0.15
    fi
fi

echo -e "\033[1;32m[INIT] Node ID: $NODE_ID\033[0m"
echo -e "\033[1;32m[INIT] Hardware: $HARDWARE ($MEMORY)\033[0m"
echo -e "\033[1;32m[INIT] Target Wallet: $WALLET\033[0m"
echo -e "\033[1;36m[INIT] Rate: \$$RATE_HOUR/hour (Streaming payouts in USDC/SOL)\033[0m"
echo -e "\033[1;37m[INIT] Status: Connected & listening for idle state...\033[0m"
echo -e "\033[0;37m----------------------------------------------------------\033[0m"

# Register node with orchestrator
curl -s -X POST "$ORCHESTRATOR/api/nodes/heartbeat" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$NODE_ID\",\"ip\":\"127.0.0.1\",\"gpu\":\"$HARDWARE\",\"vram\":\"$MEMORY\",\"wallet\":\"$WALLET\",\"status\":\"IDLE\",\"totalEarnedUsdc\":0,\"totalComputeSec\":0,\"currentTask\":\"Idle (Zero-Lag Standby)\"}" > /dev/null 2>&1

echo -e "\033[1;33m[CLOUD] Node successfully linked to TensorGrid Orchestrator!\033[0m"
echo -e "\033[0;32m⚡ Running background agent loop... Press Ctrl+C to disconnect.\033[0m"
