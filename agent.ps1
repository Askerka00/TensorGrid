# TensorGrid Node Agent (Windows Prototype)
# Demonstrates: Idle Detection -> Sandbox Worker Launch -> Instant Kill-Switch on User Input -> Solana Mock Payouts

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "              ⚡ TENSORGRID NODE AGENT v0.1               " -ForegroundColor Yellow
Write-Host "         Decentralized GPU Compute on Solana              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

param(
    [string]$Wallet = "46xHyUg3GnUZhBxvTCrSF1CGu59qQKgTRB6Sw8RyYh9L",
    [string]$Orchestrator = "http://localhost:4000"
)

# 1. Compile UserInput Hook (Win32 GetLastInputInfo)
Add-Type @"
using System;
using System.Runtime.InteropServices;

public class UserInput {
    [DllImport("user32.dll")]
    public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);

    [StructLayout(LayoutKind.Sequential)]
    public struct LASTINPUTINFO {
        public uint cbSize;
        public uint dwTime;
    }

    public static uint GetIdleMilliseconds() {
        LASTINPUTINFO lastInput = new LASTINPUTINFO();
        lastInput.cbSize = (uint)Marshal.SizeOf(lastInput);
        if (!GetLastInputInfo(ref lastInput)) return 0;
        return ((uint)Environment.TickCount - lastInput.dwTime);
    }
}
"@

# 2. Hardware Auto-Detection (GPU or CPU Fallback)
$detectedHardware = "Unknown"
$detectedMemory = "16GB"
$hardwareType = "GPU"
$ratePerHour = 0.50

try {
    # Check NVIDIA GPU via nvidia-smi
    $nvidiaSmi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
    if ($nvidiaSmi) {
        $gpuOut = (& nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits 2>$null | Select-Object -First 1)
        if ($gpuOut) {
            $parts = $gpuOut -split ","
            $detectedHardware = $parts[0].Trim()
            $detectedMemory = "$([math]::Round([int]$parts[1].Trim() / 1024))GB GDDR"
            $hardwareType = "NVIDIA CUDA"
            $ratePerHour = 0.50
        }
    }
} catch {}

if ($detectedHardware -eq "Unknown") {
    # Check other controllers (AMD Radeon, Intel Arc)
    try {
        $videoCtrl = Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch "Microsoft Basic|Virtual|Remote" } | Select-Object -First 1
        if ($videoCtrl -and $videoCtrl.Name) {
            $detectedHardware = $videoCtrl.Name.Trim()
            $ramMb = [math]::Round($videoCtrl.AdapterRAM / 1MB)
            if ($ramMb -gt 1024) {
                $detectedMemory = "$([math]::Round($ramMb / 1024))GB VRAM"
            } else {
                $detectedMemory = "Dynamic Shared VRAM"
            }
            $hardwareType = "DirectML GPU"
            $ratePerHour = 0.35
        }
    } catch {}
}

# If no discrete GPU found -> Fallback to CPU Compute mode
if ($detectedHardware -eq "Unknown") {
    try {
        $cpuInfo = (Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1).Name.Trim()
        $totalRamGb = [math]::Round((Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue).TotalPhysicalMemory / 1GB)
        $detectedHardware = "CPU: $cpuInfo"
        $detectedMemory = "${totalRamGb}GB RAM (AVX2/llama.cpp)"
        $hardwareType = "CPU Only"
        $ratePerHour = 0.15
    } catch {
        $detectedHardware = "Multi-Core CPU Compute Node"
        $detectedMemory = "16GB RAM"
        $hardwareType = "CPU Only"
        $ratePerHour = 0.15
    }
}

$IDLE_THRESHOLD_SEC = 15 # 15 sec for demo purposes
$RATE_PER_SEC = $ratePerHour / 3600.0

$nodeId = "NODE-$($env:COMPUTERNAME)"
$solanaWallet = $Wallet
$totalEarned = 0.0
$totalComputeSeconds = 0
$state = "IDLE_WAITING" # IDLE_WAITING, COMPUTING
$workerProcess = $null
$computeStart = 0

Write-Host "[INIT] Node ID: $nodeId" -ForegroundColor Green
Write-Host "[INIT] Hardware: $detectedHardware ($detectedMemory) [$hardwareType]" -ForegroundColor Green
Write-Host "[INIT] Target Wallet: $solanaWallet" -ForegroundColor Green
Write-Host "[INIT] Rate: `$$ratePerHour/hour (Streaming payouts to Solana)" -ForegroundColor Cyan
Write-Host "[INIT] Idle Threshold: $IDLE_THRESHOLD_SEC seconds" -ForegroundColor Gray
Write-Host "[INIT] Status: Listening for user activity and idle state..." -ForegroundColor White
Write-Host "----------------------------------------------------------" -ForegroundColor Gray

# Register initial heartbeat with orchestrator
try {
    $body = @{
        id = $nodeId
        ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*","Ethernet*" -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
        gpu = $detectedHardware
        vram = $detectedMemory
        wallet = $solanaWallet
        status = "IDLE"
        totalEarnedUsdc = 0
        totalComputeSec = 0
        currentTask = "Idle (Zero-Lag Standby)"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$Orchestrator/api/nodes/heartbeat" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 2 -ErrorAction SilentlyContinue | Out-Null
    Write-Host "[CLOUD] Node successfully linked to TensorGrid Orchestrator!" -ForegroundColor Yellow
} catch {}

while ($true) {
    $idleMs = [UserInput]::GetIdleMilliseconds()
    $idleSec = [math]::Floor($idleMs / 1000)

    if ($state -eq "IDLE_WAITING") {
        if ($idleSec -ge $IDLE_THRESHOLD_SEC) {
            # Transition to compute mode
            $state = "COMPUTING"
            $computeStart = [Environment]::TickCount
            Write-Host "`n[TRANSITION] System idle for $idleSec sec. Starting TensorGrid Worker..." -ForegroundColor Green
            
            # Launch background worker (emulated AI/Render task)
            $workerScript = "while(`$true) { Start-Sleep -Milliseconds 500 }"
            $workerProcess = Start-Process powershell -ArgumentList "-NoProfile -Command $workerScript" -PassThru -WindowStyle Hidden
            Write-Host "[WORKER] Container/Process started (PID: $($workerProcess.Id))" -ForegroundColor Cyan
            Write-Host "[SOLANA] Escrow session locked. Streaming micro-payouts in `$USDC..." -ForegroundColor Yellow
        } else {
            Write-Host -NoNewline "`r[ACTIVE] User active. Time since last input: ${idleSec}s / ${IDLE_THRESHOLD_SEC}s   "
        }
    }
    elseif ($state -eq "COMPUTING") {
        # Check Kill-Switch: if mouse moved or key pressed
        if ($idleSec -lt 2) {
            # INSTANT KILL-SWITCH
            $killStart = [Environment]::TickCount
            if ($workerProcess -and -not $workerProcess.HasExited) {
                Stop-Process -Id $workerProcess.Id -Force -ErrorAction SilentlyContinue
            }
            $killTimeMs = [Environment]::TickCount - $killStart
            
            $state = "IDLE_WAITING"
            Write-Host "`n`n🚨 [KILL-SWITCH TRIGGERED] User input detected!" -ForegroundColor Red
            Write-Host "⚡ Worker PID $($workerProcess.Id) terminated in ${killTimeMs}ms (Zero Lag for Gamer)." -ForegroundColor Yellow
            Write-Host "💰 Session finalized. Total Earned: `$([math]::Round($totalEarned, 5)) USDC`n" -ForegroundColor Green
            Write-Host "----------------------------------------------------------" -ForegroundColor Gray
        } else {
            # Continue computing and streaming rewards
            $totalComputeSeconds += 1
            $earnedThisSecond = $RATE_PER_SEC
            $totalEarned += $earnedThisSecond

            $duration = [math]::Floor(([Environment]::TickCount - $computeStart) / 1000)
            Write-Host -NoNewline "`r⚡ [COMPUTING] Task: PyTorch LLM Inference | Duration: ${duration}s | Earned: `$([math]::Round($totalEarned, 5)) USDC   "
        }
    }

    Start-Sleep -Seconds 1
}
