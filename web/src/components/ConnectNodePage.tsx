import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Download,
  Laptop,
  ArrowLeft,
  Coins,
  CheckCircle2,
  Cpu,
  Terminal,
  Layers,
  Info,
  Sparkles,
} from 'lucide-react';

import { registerNode } from '../api';

interface ConnectNodePageProps {
  onBackToDashboard: () => void;
  defaultWallet: string;
  onNodeRegistered?: () => void;
}

type HardwareCategory = 'nvidia' | 'apple' | 'amd' | 'cpu' | 'custom';

interface HardwarePreset {
  id: string;
  name: string;
  vram: string;
  rate: number; // USD per hour
}

const HARDWARE_PRESETS: Record<HardwareCategory, HardwarePreset[]> = {
  nvidia: [
    { id: 'rtx5090', name: 'NVIDIA GeForce RTX 5090', vram: '32GB GDDR7', rate: 0.70 },
    { id: 'rtx4090', name: 'NVIDIA GeForce RTX 4090', vram: '24GB GDDR6X', rate: 0.50 },
    { id: 'rtx4080', name: 'NVIDIA GeForce RTX 4080', vram: '16GB GDDR6X', rate: 0.40 },
    { id: 'rtx4070ti', name: 'NVIDIA GeForce RTX 4070 Ti', vram: '12GB GDDR6X', rate: 0.35 },
    { id: 'rtx3090', name: 'NVIDIA GeForce RTX 3090', vram: '24GB GDDR6X', rate: 0.40 },
    { id: 'rtx3080', name: 'NVIDIA GeForce RTX 3080', vram: '10GB GDDR6X', rate: 0.30 },
    { id: 'rtx3060', name: 'NVIDIA GeForce RTX 3060 / 4060', vram: '12GB GDDR6', rate: 0.25 },
    { id: 'gtx1660', name: 'NVIDIA GeForce GTX 1660 / 2060', vram: '6GB GDDR6', rate: 0.20 },
    { id: 'a100', name: 'NVIDIA A100 Tensor Core', vram: '80GB HBM2e', rate: 0.85 },
  ],
  apple: [
    { id: 'm4max', name: 'Apple M4 Max (Metal MPS)', vram: '128GB Unified Memory', rate: 0.55 },
    { id: 'm3max', name: 'Apple M3 Max (Metal MPS)', vram: '64GB Unified Memory', rate: 0.45 },
    { id: 'm3pro', name: 'Apple M3 Pro (Metal MPS)', vram: '36GB Unified Memory', rate: 0.35 },
    { id: 'm2m1', name: 'Apple M2 / M1 (Metal MPS)', vram: '16GB Unified Memory', rate: 0.25 },
    { id: 'macmini', name: 'Apple Mac mini / Air (M-series)', vram: '16GB-24GB Unified', rate: 0.25 },
  ],
  amd: [
    { id: 'rx7900xtx', name: 'AMD Radeon RX 7900 XTX', vram: '24GB GDDR6', rate: 0.40 },
    { id: 'rx7900xt', name: 'AMD Radeon RX 7900 XT', vram: '20GB GDDR6', rate: 0.35 },
    { id: 'rx7800xt', name: 'AMD Radeon RX 7800 XT', vram: '16GB GDDR6', rate: 0.30 },
    { id: 'rx6800xt', name: 'AMD Radeon RX 6800 XT', vram: '16GB GDDR6', rate: 0.25 },
    { id: 'rx6700xt', name: 'AMD Radeon RX 6700 XT', vram: '12GB GDDR6', rate: 0.20 },
  ],
  cpu: [
    { id: 'i9', name: 'Intel Core i9-14900K (llama.cpp AVX2)', vram: '64GB DDR5 RAM', rate: 0.20 },
    { id: 'ryzen9', name: 'AMD Ryzen 9 7950X (AVX-512)', vram: '64GB DDR5 RAM', rate: 0.20 },
    { id: 'i7_ryzen7', name: 'Intel Core i7 / AMD Ryzen 7 (8-16 cores)', vram: '32GB DDR4/DDR5', rate: 0.15 },
    { id: 'i5_ryzen5', name: 'Intel Core i5 / AMD Ryzen 5 (6 cores)', vram: '16GB RAM', rate: 0.12 },
    { id: 'universal_cpu', name: 'Universal Laptop / Desktop CPU (4+ cores)', vram: '16GB RAM', rate: 0.10 },
  ],
  custom: [
    { id: 'custom', name: 'Custom Hardware Accelerator', vram: '16GB', rate: 0.25 },
  ],
};

export const ConnectNodePage: React.FC<ConnectNodePageProps> = ({
  onBackToDashboard,
  defaultWallet,
  onNodeRegistered,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [wallet, setWallet] = useState(defaultWallet);

  // Connection method tab: 'windows' | 'mac' | 'linux'
  const [osTab, setOsTab] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [dockerMode, setDockerMode] = useState<'gpu' | 'cpu'>('gpu');

  // Form state
  const [category, setCategory] = useState<HardwareCategory>('nvidia');
  const [nodeId, setNodeId] = useState('MY-GAMING-PC');
  const [ipAddress, setIpAddress] = useState('192.168.1.45');
  const [gpuModel, setGpuModel] = useState('NVIDIA GeForce RTX 4080');
  const [customModel, setCustomModel] = useState('');
  const [vram, setVram] = useState('16GB GDDR6X');
  const [currentRate, setCurrentRate] = useState(0.40);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Calculator state
  const [idleHours, setIdleHours] = useState(14);
  const userRatePerHour = currentRate * 0.70; // 70% paid to node owner
  const dailyEarning = (idleHours * userRatePerHour).toFixed(2);
  const monthlyEarning = (idleHours * userRatePerHour * 30).toFixed(0);

  // Commands (Dynamic origin for local or deployed Vercel domain)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000';
  const psCommand = `irm ${origin}/agent.ps1 | iex`;
  const psCustomCommand = `& {[scriptblock]::Create((irm ${origin}/agent.ps1))}.Invoke() -Wallet "${wallet}"`;
  
  const macCommand = `curl -fsSL ${origin}/agent.sh | bash`;
  const macCustomCommand = `curl -fsSL ${origin}/agent.sh | bash -s -- "${wallet}"`;

  const dockerGpuCmd = `docker run -d --gpus all --name tensorgrid-agent -e WALLET="${wallet}" -e ORCHESTRATOR="${origin}" tensorgrid/agent:latest`;
  const dockerCpuCmd = `docker run -d --name tensorgrid-cpu-agent -e WALLET="${wallet}" -e ORCHESTRATOR="${origin}" tensorgrid/agent:cpu-latest`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleCategoryChange = (cat: HardwareCategory) => {
    setCategory(cat);
    const presets = HARDWARE_PRESETS[cat];
    if (presets && presets.length > 0) {
      setGpuModel(presets[0].name);
      setVram(presets[0].vram);
      setCurrentRate(presets[0].rate);
    }
    if (cat === 'cpu') {
      setNodeId('MY-CPU-NODE');
    } else if (cat === 'apple') {
      setNodeId('MY-MACBOOK-PRO');
    } else if (cat === 'amd') {
      setNodeId('MY-RADEON-RIG');
    } else {
      setNodeId('MY-GAMING-PC');
    }
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = HARDWARE_PRESETS[category].find((p) => p.id === presetId);
    if (preset) {
      setGpuModel(preset.name);
      setVram(preset.vram);
      setCurrentRate(preset.rate);
    }
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeId.trim()) return;

    const finalModel = category === 'custom' ? (customModel.trim() || 'Custom Accelerator') : gpuModel;

    setIsRegistering(true);
    const res = await registerNode({
      id: nodeId.trim().toUpperCase(),
      ip: ipAddress.trim() || '127.0.0.1',
      gpu: finalModel,
      vram: vram,
      status: 'IDLE',
      wallet: wallet.trim(),
      totalEarnedUsdc: 0,
      totalComputeSec: 0,
      currentTask: 'Idle (Zero-Lag Standby)',
    });
    setIsRegistering(false);

    if (res && res.success) {
      setRegisteredSuccess(true);
      if (onNodeRegistered) onNodeRegistered();
      setTimeout(() => {
        onBackToDashboard();
      }, 1500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafc] p-6 lg:p-8 select-none">
      {/* Top Navigation */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200/90 bg-white text-xs font-semibold text-gray-700 hover:text-gray-950 hover:bg-gray-50 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Nodes Dashboard</span>
        </button>

        <span className="text-xs font-medium text-gray-400">
          TensorGrid DePIN Client Setup • Universal v0.2
        </span>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Hero Banner */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 lg:p-8 shadow-2xs relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-3">
              <Laptop className="w-3.5 h-3.5" />
              <span>Universal Hardware Onboarding • NVIDIA • Apple Silicon • AMD • CPU</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Connect your PC or Server to TensorGrid
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              The agent runs silently in the background <strong className="text-gray-800">only when you are not actively using your computer</strong> (overnight or away at work/school).
              As soon as you move your mouse or press a key, compute workloads pause instantly in 3ms (<strong className="text-gray-800">Smart Zero-Lag</strong>).
              Earned rewards stream directly to your Solana wallet in real time.
            </p>
          </div>
        </div>

        {/* What if no NVIDIA GPU card? */}
        <div className="bg-gradient-to-br from-white to-[#fbfbff] border border-blue-200/70 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                What if your computer does not have a dedicated NVIDIA GPU?
              </h2>
              <p className="text-xs text-gray-500">
                TensorGrid is a universal compute network: you can connect <strong className="text-gray-700">any PC, Mac, or CPU processor</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
            {/* 1. CPU-Only Mode */}
            <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-blue-600 font-bold text-xs">
                  <Cpu className="w-4 h-4" />
                  <span>CPU-Only Mode</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal mb-2">
                  Any 4+ core <strong>Intel Core</strong> or <strong>AMD Ryzen</strong> processor.
                </p>
                <div className="text-[10px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 space-y-1">
                  <div>• Quantized LLM Inference (llama.cpp Q4)</div>
                  <div>• Vector Embeddings for RAG</div>
                  <div>• Whisper Audio Transcription</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Est. Earnings:</span>
                <span className="font-semibold text-emerald-600">up to ~$35/mo</span>
              </div>
            </div>

            {/* 2. Apple Silicon Mac */}
            <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-purple-600 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Apple Silicon (Mac)</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal mb-2">
                  MacBook / Mac mini / Studio on <strong>M1 / M2 / M3 / M4</strong>.
                </p>
                <div className="text-[10px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 space-y-1">
                  <div>• Unified Memory up to 128GB</div>
                  <div>• Apple Metal MPS & MLX Framework</div>
                  <div>• High-parameter LLMs (LLaMA 70B)</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Est. Earnings:</span>
                <span className="font-semibold text-purple-600">up to ~$90/mo</span>
              </div>
            </div>

            {/* 3. AMD Radeon */}
            <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-rose-600 font-bold text-xs">
                  <Layers className="w-4 h-4" />
                  <span>AMD Radeon</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal mb-2">
                  Graphics cards series <strong>RX 6000 / 7000</strong> (12–24GB).
                </p>
                <div className="text-[10px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 space-y-1">
                  <div>• Microsoft DirectML (on Windows)</div>
                  <div>• AMD ROCm Linux Containers</div>
                  <div>• Stable Diffusion & Rendering</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Est. Earnings:</span>
                <span className="font-semibold text-rose-600">up to ~$75/mo</span>
              </div>
            </div>

            {/* 4. Smart Auto-Detection */}
            <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-emerald-600 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Smart Auto-Detection</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal mb-2">
                  You <strong>do not need to configure anything manually</strong>.
                </p>
                <div className="text-[10px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 space-y-1">
                  <div>• Auto-probes CUDA, Metal & ROCm drivers</div>
                  <div>• Seamless fallback to CPU compute mode</div>
                  <div>• Thermal limits & zero system freezing</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Setup:</span>
                <span className="font-semibold text-emerald-600">1-Line Shell Command</span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK AGENT LAUNCH (With OS Switcher) */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>Quick Agent Launch (1-Click Run)</span>
              </h3>
              <p className="text-xs text-gray-500">
                Select your operating system to get a preconfigured launcher command:
              </p>
            </div>

            {/* OS Tab Selector */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setOsTab('windows')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  osTab === 'windows'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🪟 Windows (GPU / CPU)
              </button>
              <button
                onClick={() => setOsTab('mac')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  osTab === 'mac'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🍏 macOS (Apple Silicon Metal)
              </button>
              <button
                onClick={() => setOsTab('linux')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  osTab === 'linux'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🐧 Linux / Docker
              </button>
            </div>
          </div>

          {/* Windows View */}
          {osTab === 'windows' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-500">
                Run the command in <strong className="text-gray-800">PowerShell</strong>. The agent automatically detects your graphics card (NVIDIA / AMD) or falls back to <strong>CPU Compute</strong> mode if no dedicated GPU is present.
              </div>

              <div>
                <div className="text-[11px] font-semibold text-gray-600 mb-1.5 flex items-center justify-between">
                  <span>Standard Run:</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Auto Hardware Detection
                  </span>
                </div>
                <div className="bg-[#0f141c] rounded-xl p-3.5 border border-gray-800 font-mono text-xs text-emerald-400 relative flex items-center justify-between gap-3">
                  <span className="truncate select-all">{psCommand}</span>
                  <button
                    onClick={() => copyToClipboard(psCommand, 'ps1')}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex-shrink-0"
                    title="Copy"
                  >
                    {copiedCmd === 'ps1' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-gray-600 mb-1.5">
                  Or with automatic Solana wallet binding:
                </div>
                <div className="bg-[#0f141c] rounded-xl p-3 border border-gray-800 font-mono text-[11px] text-gray-300 relative flex items-center justify-between gap-3">
                  <span className="truncate select-all">{psCustomCommand}</span>
                  <button
                    onClick={() => copyToClipboard(psCustomCommand, 'ps2')}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex-shrink-0"
                    title="Copy"
                  >
                    {copiedCmd === 'ps2' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <a
                  href="/agent.ps1"
                  download="agent.ps1"
                  className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download agent.ps1 script directly</span>
                </a>
                <span className="text-[11px] text-gray-400 font-mono">
                  Zero-Lag Win32 Hooks
                </span>
              </div>
            </div>
          )}

          {/* macOS View */}
          {osTab === 'mac' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-500">
                Open the <strong className="text-gray-800">Terminal</strong> app on your Mac and run the command. The agent leverages <strong>Apple Metal MPS & MLX</strong> to accelerate LLMs with unified memory.
              </div>

              <div>
                <div className="text-[11px] font-semibold text-gray-600 mb-1.5 flex items-center justify-between">
                  <span>Launch for Mac (M1/M2/M3/M4 & Intel Mac):</span>
                  <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                    Metal MPS
                  </span>
                </div>
                <div className="bg-[#0f141c] rounded-xl p-3.5 border border-gray-800 font-mono text-xs text-purple-300 relative flex items-center justify-between gap-3">
                  <span className="truncate select-all">{macCommand}</span>
                  <button
                    onClick={() => copyToClipboard(macCommand, 'mac1')}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex-shrink-0"
                    title="Copy"
                  >
                    {copiedCmd === 'mac1' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-gray-600 mb-1.5">
                  With automatic Solana wallet binding:
                </div>
                <div className="bg-[#0f141c] rounded-xl p-3 border border-gray-800 font-mono text-[11px] text-gray-300 relative flex items-center justify-between gap-3">
                  <span className="truncate select-all">{macCustomCommand}</span>
                  <button
                    onClick={() => copyToClipboard(macCustomCommand, 'mac2')}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex-shrink-0"
                    title="Copy"
                  >
                    {copiedCmd === 'mac2' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <a
                  href="/agent.sh"
                  download="agent.sh"
                  className="inline-flex items-center gap-1.5 font-semibold text-purple-600 hover:text-purple-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download agent.sh script</span>
                </a>
                <span className="text-[11px] text-gray-400 font-mono">
                  Apple Silicon Native
                </span>
              </div>
            </div>
          )}

          {/* Linux / Docker View */}
          {osTab === 'linux' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Isolated Docker container launch: select mode based on NVIDIA GPU availability.
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
                  <button
                    onClick={() => setDockerMode('gpu')}
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${
                      dockerMode === 'gpu' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'
                    }`}
                  >
                    NVIDIA GPU
                  </button>
                  <button
                    onClick={() => setDockerMode('cpu')}
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${
                      dockerMode === 'cpu' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'
                    }`}
                  >
                    💻 CPU-Only (No GPU)
                  </button>
                </div>
              </div>

              <div>
                <div className="bg-[#0f141c] rounded-xl p-3.5 border border-gray-800 font-mono text-xs text-purple-300 relative flex items-center justify-between gap-3">
                  <span className="truncate select-all">
                    {dockerMode === 'gpu' ? dockerGpuCmd : dockerCpuCmd}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(dockerMode === 'gpu' ? dockerGpuCmd : dockerCpuCmd, 'docker')
                    }
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex-shrink-0"
                    title="Copy"
                  >
                    {copiedCmd === 'docker' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {dockerMode === 'gpu'
                      ? 'NVIDIA Container Toolkit with GPU passthrough'
                      : 'Lightweight CPU container with AVX2/AVX-512 acceleration'}
                  </span>
                </div>
                <span className="text-gray-400 font-mono">HiveOS / Ubuntu / Debian</span>
              </div>
            </div>
          )}
        </div>

        {/* MANUAL NODE REGISTRATION FORM */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 lg:p-8 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-orange-50 text-[#ff6422] flex items-center justify-center font-bold text-xs">
                ★
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                Register Node via Web Form
              </h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              Instant registration in compute network
            </span>
          </div>

          {/* Hardware Category Selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Hardware Architecture:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('nvidia')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  category === 'nvidia'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-2xs'
                    : 'border-gray-200/90 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🚀 NVIDIA RTX</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('apple')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  category === 'apple'
                    ? 'border-purple-500 bg-purple-50/80 text-purple-800 shadow-2xs'
                    : 'border-gray-200/90 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🍏 Apple Silicon</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('amd')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  category === 'amd'
                    ? 'border-rose-500 bg-rose-50/80 text-rose-800 shadow-2xs'
                    : 'border-gray-200/90 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🔴 AMD Radeon</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('cpu')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  category === 'cpu'
                    ? 'border-blue-500 bg-blue-50/80 text-blue-800 shadow-2xs'
                    : 'border-gray-200/90 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>💻 CPU Only (No GPU)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('custom')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  category === 'custom'
                    ? 'border-orange-500 bg-orange-50/80 text-orange-800 shadow-2xs'
                    : 'border-gray-200/90 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>✏️ Other (Custom)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleManualRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Node ID / Machine Name
                </label>
                <input
                  type="text"
                  required
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                  placeholder="MY-PC-NODE"
                  className="w-full bg-[#fbfbfd] border border-gray-200/90 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  IP Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="192.168.1.45"
                  className="w-full bg-[#fbfbfd] border border-gray-200/90 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {category === 'cpu' ? 'Processor (CPU)' : 'GPU / Accelerator Model'}
                </label>
                {category === 'custom' ? (
                  <input
                    type="text"
                    required
                    value={customModel}
                    onChange={(e) => {
                      setCustomModel(e.target.value);
                      setGpuModel(e.target.value);
                    }}
                    placeholder="e.g. Intel Arc A770 or Snapdragon X"
                    className="w-full bg-[#fbfbfd] border border-gray-200/90 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                  />
                ) : (
                  <select
                    value={HARDWARE_PRESETS[category].find((p) => p.name === gpuModel)?.id || ''}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full bg-[#fbfbfd] border border-gray-200/90 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                  >
                    {HARDWARE_PRESETS[category].map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name} (${preset.rate}/hr)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {category === 'cpu' ? 'RAM Capacity' : 'Memory (VRAM / Unified)'}
                </label>
                <input
                  type="text"
                  value={vram}
                  onChange={(e) => setVram(e.target.value)}
                  className="w-full bg-[#fbfbfd] border border-gray-200/90 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Solana Wallet for Payouts ($USDC / $SOL)
              </label>
              <input
                type="text"
                required
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="Phantom or Solflare wallet address..."
                className="w-full bg-[#fbfbfd] border border-gray-200/90 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400">
                Node will immediately appear in the Compute Nodes table in IDLE state.
              </span>

              <button
                type="submit"
                disabled={isRegistering}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition-all"
              >
                {registeredSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Node registered successfully! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>{isRegistering ? 'Registering...' : 'Register & Connect Node'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* REVENUE CALCULATOR (Dynamic, linked to hardware presets) */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 lg:p-8 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#ff6422]" />
                <span>Revenue Calculator for: <span className="text-blue-600">{category === 'custom' ? (customModel || 'Custom Hardware') : gpuModel}</span></span>
              </h3>
              <p className="text-xs text-gray-500">
                Base rate: <strong className="text-gray-800">${currentRate.toFixed(2)}/hr</strong> (70% or <strong className="text-emerald-600">${userRatePerHour.toFixed(2)}/hr</strong> streamed to you via Solana Escrow).
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-gray-400">Per Day</div>
                <div className="text-xl font-bold text-emerald-600 font-mono">
                  ${dailyEarning} USDC
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Per Month (~30 days)</div>
                <div className="text-2xl font-bold text-[#ff6422] font-mono">
                  ~${monthlyEarning} USDC
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
              <span>Daily Idle Hours (when not actively gaming or working):</span>
              <span className="text-sm font-bold text-blue-600">{idleHours} hrs/day</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={idleHours}
              onChange={(e) => setIdleHours(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff6422]"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
              <span>1 hr</span>
              <span>8 hrs (sleep)</span>
              <span>16 hrs (work + sleep)</span>
              <span>24 hrs (24/7 dedicated)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
