# TensorGrid Node Agent (Windows Prototype)
# Demonstrates: Idle Detection -> Sandbox Worker Launch -> Instant Kill-Switch on User Input -> Solana Mock Payouts

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "              ⚡ TENSORGRID NODE AGENT v0.1               " -ForegroundColor Yellow
Write-Host "         Decentralized GPU Compute on Solana              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

param(
    [string]$Wallet = "46xHyUg3GnUZhBxvTCrSF1CGu59qQKgTRB6Sw8RyYh9L"
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

$IDLE_THRESHOLD_SEC = 15 # Для демонстрации: 15 секунд простоя (в проде: 300 сек / 5 мин)
$RATE_PER_HOUR = 0.50 # $0.50/час
$RATE_PER_SEC = $RATE_PER_HOUR / 3600.0

$nodeId = "NODE-AZURE-PC01"
$solanaWallet = $Wallet
$totalEarned = 0.0
$totalComputeSeconds = 0
$state = "IDLE_WAITING" # IDLE_WAITING, COMPUTING
$workerProcess = $null
$computeStart = 0

Write-Host "[INIT] Node ID: $nodeId" -ForegroundColor Green
Write-Host "[INIT] Target Wallet: $solanaWallet" -ForegroundColor Green
Write-Host "[INIT] Idle Threshold: $IDLE_THRESHOLD_SEC seconds" -ForegroundColor Gray
Write-Host "[INIT] Status: Listening for user activity and idle state..." -ForegroundColor White
Write-Host "----------------------------------------------------------" -ForegroundColor Gray

while ($true) {
    $idleMs = [UserInput]::GetIdleMilliseconds()
    $idleSec = [math]::Floor($idleMs / 1000)

    if ($state -eq "IDLE_WAITING") {
        if ($idleSec -ge $IDLE_THRESHOLD_SEC) {
            # Переход в режим вычислений
            $state = "COMPUTING"
            $computeStart = [Environment]::TickCount
            Write-Host "`n[TRANSITION] System idle for $idleSec sec. Starting TensorGrid Worker..." -ForegroundColor Green
            
            # Запуск фонового воркера (эмуляция AI/Render задачи)
            $workerScript = "while(`$true) { Start-Sleep -Milliseconds 500 }"
            $workerProcess = Start-Process powershell -ArgumentList "-NoProfile -Command $workerScript" -PassThru -WindowStyle Hidden
            Write-Host "[WORKER] Container/Process started (PID: $($workerProcess.Id))" -ForegroundColor Cyan
            Write-Host "[SOLANA] Escrow session locked. Streaming micro-payouts in `$USDC..." -ForegroundColor Yellow
        } else {
            Write-Host -NoNewline "`r[ACTIVE] User active. Time since last input: ${idleSec}s / ${IDLE_THRESHOLD_SEC}s   "
        }
    }
    elseif ($state -eq "COMPUTING") {
        # Проверка Kill-Switch: если мышь дернулась или нажата клавиша
        if ($idleSec -lt 2) {
            # МГНОВЕННЫЙ СБРОС (KILL-SWITCH)
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
            # Продолжаем вычисления и стриминг наград
            $totalComputeSeconds += 1
            $earnedThisSecond = $RATE_PER_SEC
            $totalEarned += $earnedThisSecond

            $duration = [math]::Floor(([Environment]::TickCount - $computeStart) / 1000)
            Write-Host -NoNewline "`r⚡ [COMPUTING] Task: PyTorch LLM Inference | Duration: ${duration}s | Earned: `$([math]::Round($totalEarned, 5)) USDC   "
        }
    }

    Start-Sleep -Seconds 1
}
