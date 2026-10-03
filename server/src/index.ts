import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { initPayer, airdropIfNeeded, sendPayout, getBalance, PayoutResult } from './solana';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const webDistPath = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));
}

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Solana transaction history
const txHistory: PayoutResult[] = [];

interface NodeInfo {
  id: string;
  ip: string;
  gpu: string;
  vram: string;
  status: 'IDLE' | 'COMPUTING' | 'OFFLINE';
  wallet: string;
  totalEarnedUsdc: number;
  totalComputeSec: number;
  lastHeartbeat: number;
  currentTask?: string;
}

const nodes: Map<string, NodeInfo> = new Map();

// Initialize Azure PC-01 as a registered node
nodes.set('NODE-AZURE-PC01', {
  id: 'NODE-AZURE-PC01',
  ip: '20.203.106.30',
  gpu: 'Standard B2ats (Emulated GPU)',
  vram: 'NVIDIA RTX 4080 (Mocked)',
  status: 'COMPUTING',
  wallet: 'FK4cdGVfnzqboHtkrNv3EPoP1eM3c6Gf1Ro1Sz3TVwKd',
  totalEarnedUsdc: 0,
  totalComputeSec: 0,
  lastHeartbeat: Date.now(),
  currentTask: 'PyTorch: Llama-3.3-70B Batch Inference',
});

// Background timer: update counters every second
const RATE_PER_SEC = 0.50 / 3600.0;
setInterval(() => {
  for (const node of nodes.values()) {
    if (node.status === 'COMPUTING') {
      node.totalComputeSec += 1;
      node.totalEarnedUsdc += RATE_PER_SEC;
    }
  }
}, 1000);

// Real payouts to Solana Devnet wallet every 30 seconds
const PAYOUT_INTERVAL = parseInt(process.env.PAYOUT_INTERVAL_SEC || '30') * 1000;
const PAYOUT_SOL = 0.001; // 0.001 SOL per cycle (demo)

async function startSolanaPayouts() {
  try {
    initPayer();
    await airdropIfNeeded();
    console.log('[SOLANA] ✅ Payer initialized. Streaming payouts enabled.\n');
  } catch (e: any) {
    console.warn('[SOLANA] ⚠️ Init failed:', e.message, '— payouts disabled');
    return;
  }

  setInterval(async () => {
    try {
      for (const node of nodes.values()) {
        if (node.status === 'COMPUTING' && node.wallet) {
          const result = await sendPayout(node.wallet, PAYOUT_SOL);
          txHistory.unshift(result);
          if (txHistory.length > 50) txHistory.pop();
        }
      }
    } catch (e: any) {
      console.warn('[SOLANA] ⚠️ Transient cycle error:', e?.message || e);
    }
  }, PAYOUT_INTERVAL);
}

startSolanaPayouts();

// REST API: Live nodes, statistics and status
app.get(['/api/nodes', '/nodes'], (req: Request, res: Response) => {
  const nodeList = Array.from(nodes.values());
  const activeNodes = nodeList.filter(n => n.status !== 'OFFLINE').length;
  const computingNodes = nodeList.filter(n => n.status === 'COMPUTING').length;
  const totalUsdc = nodeList.reduce((acc, n) => acc + n.totalEarnedUsdc, 0);

  res.json({
    nodes: nodeList,
    activeNodes,
    computingNodes,
    totalUsdc,
    transactions: txHistory,
  });
});

// HTML Dashboard for visual network monitoring in the browser
app.get('/', (req: Request, res: Response) => {
  const webDistIndex = path.resolve(__dirname, '../../web/dist/index.html');
  if (fs.existsSync(webDistIndex)) {
    return res.sendFile(webDistIndex);
  }

  const nodeList = Array.from(nodes.values());
  const activeNodes = nodeList.filter(n => n.status !== 'OFFLINE').length;
  const computingNodes = nodeList.filter(n => n.status === 'COMPUTING').length;
  const totalUsdc = nodeList.reduce((acc, n) => acc + n.totalEarnedUsdc, 0);

  const html = `

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>⚡ TensorGrid Orchestrator Dashboard</title>
  <meta http-equiv="refresh" content="2">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; padding: 24px; }
    h1 { color: #58a6ff; display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .subtitle { color: #8b949e; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; }
    .card-title { font-size: 13px; color: #8b949e; text-transform: uppercase; margin-bottom: 6px; }
    .card-val { font-size: 26px; font-weight: bold; color: #f0f6fc; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-idle { background: #1f6feb33; color: #58a6ff; border: 1px solid #1f6feb; }
    .badge-comp { background: #23863633; color: #3fb950; border: 1px solid #238636; }
    .controls { margin-bottom: 24px; display: flex; gap: 12px; }
    .btn { padding: 10px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 14px; text-decoration: none; display: inline-block; }
    .btn-green { background: #238636; color: #fff; }
    .btn-green:hover { background: #2ea043; }
    .btn-red { background: #da3633; color: #fff; }
    .btn-red:hover { background: #f85149; }
    table { width: 100%; border-collapse: collapse; background: #161b22; border-radius: 8px; overflow: hidden; border: 1px solid #30363d; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #21262d; font-size: 14px; }
    th { background: #0d1117; color: #8b949e; font-weight: 600; }
    .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
  </style>
</head>
<body>
  <h1>⚡ TensorGrid Orchestrator <span class="badge badge-comp pulse">Online (Solana Devnet)</span></h1>
  <div class="subtitle">Decentralized GPU sharing for AI compute and 3D rendering</div>

  <div class="stats-grid">
    <div class="card">
      <div class="card-title">Active Nodes</div>
      <div class="card-val">${activeNodes} / ${nodeList.length}</div>
    </div>
    <div class="card">
      <div class="card-title">Active Tasks</div>
      <div class="card-val" style="color: #3fb950;">${computingNodes}</div>
    </div>
    <div class="card">
      <div class="card-title">Network Rate</div>
      <div class="card-val">$0.50 / hr</div>
    </div>
    <div class="card">
      <div class="card-title">Streamed Earnings</div>
      <div class="card-val" style="color: #f1e05a;">$${totalUsdc.toFixed(5)}</div>
    </div>
  </div>

  <div class="card" style="margin-bottom: 24px;">
    <div class="card-title">👛 Bind Solana Wallet for Payouts (Phantom / Solflare)</div>
    <div style="display: flex; gap: 10px; margin-top: 10px;">
      <input id="walletInput" type="text" placeholder="Enter your Solana wallet public address (e.g. from Phantom)..." value="${nodeList[0]?.wallet || ''}" style="flex: 1; padding: 10px 14px; background: #0d1117; border: 1px solid #30363d; color: #58a6ff; font-weight: 600; border-radius: 6px; font-family: monospace; font-size: 14px;" />
      <button class="btn btn-green" onclick="fetch('/api/nodes/wallet', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:'NODE-AZURE-PC01', wallet: document.getElementById('walletInput').value})}).then(()=>location.reload())">💾 Save Wallet</button>
    </div>
  </div>

  <div class="controls">
    <button class="btn btn-green" onclick="fetch('/api/tasks/submit', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'AI Inference', model:'Llama-3.3-70B'})}).then(()=>location.reload())">
      ⚡ Dispatch AI Task ($USDC Streaming)
    </button>
    <button class="btn btn-red" onclick="fetch('/api/tasks/stop', {method:'POST'}).then(()=>location.reload())">
      🛑 Stop Task (Kill-Switch / IDLE)
    </button>
  </div>

  <h2>Connected Compute Nodes</h2>
  <table>
    <thead>
      <tr>
        <th>Node ID</th>
        <th>IP Address</th>
        <th>Hardware / GPU</th>
        <th>Status</th>
        <th>Current Task</th>
        <th>Uptime</th>
        <th>Wallet Balance</th>
      </tr>
    </thead>
    <tbody>
      ${nodeList.map(n => `
        <tr>
          <td><strong>${n.id}</strong></td>
          <td><code>${n.ip}</code></td>
          <td>${n.gpu} (${n.vram})</td>
          <td>
            <span class="badge ${n.status === 'COMPUTING' ? 'badge-comp' : 'badge-idle'}">
              ${n.status === 'COMPUTING' ? '⚡ COMPUTING' : '💤 IDLE'}
            </span>
          </td>
          <td>${n.currentTask || 'Idle (Zero-Lag Standby)'}</td>
          <td>${n.totalComputeSec} sec</td>
          <td style="color: #3fb950; font-weight: bold;">$${n.totalEarnedUsdc.toFixed(5)} USDC</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2 style="margin-top: 24px;">🔗 Solana Devnet Payout History (Real Transactions)</h2>
  ${txHistory.length === 0 ? '<p style="color: #8b949e;">First transaction will be sent in ~30 seconds...</p>' : `
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Status</th>
        <th>Amount SOL</th>
        <th>Recipient</th>
        <th>TX Signature (Click for Solana Explorer)</th>
      </tr>
    </thead>
    <tbody>
      ${txHistory.slice(0, 20).map((tx, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${tx.success ? '<span style="color:#3fb950;">✅ Confirmed</span>' : '<span style="color:#f85149;">❌ Failed</span>'}</td>
          <td style="color: #f1e05a; font-weight: bold;">${tx.amountSol} SOL</td>
          <td><code>${tx.recipient.slice(0, 8)}...${tx.recipient.slice(-6)}</code></td>
          <td>${tx.signature ? `<a href="${tx.explorerUrl}" target="_blank" style="color: #58a6ff;">${tx.signature.slice(0, 20)}...</a>` : (tx.error || 'N/A')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  `}

</body>
</html>
  `;
  res.send(html);
});

// Serve agent.ps1 script for easy 1-click execution on Windows
app.get('/agent.ps1', (req: Request, res: Response) => {
  const agentPath = path.resolve(__dirname, '../../agent.ps1');
  if (fs.existsSync(agentPath)) {
    let content = fs.readFileSync(agentPath, 'utf8');
    const host = req.get('host') || 'localhost:4000';
    const proto = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const serverUrl = `${proto}://${host}`;
    content = content.replace(/http:\/\/localhost:4000/g, serverUrl);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(content);
  }
  res.status(404).send('# agent.ps1 not found');
});

// Serve agent.sh script for macOS (Apple Silicon Metal) and Linux (CPU / CUDA)
app.get('/agent.sh', (req: Request, res: Response) => {
  const agentPath = path.resolve(__dirname, '../../agent.sh');
  if (fs.existsSync(agentPath)) {
    let content = fs.readFileSync(agentPath, 'utf8');
    const host = req.get('host') || 'localhost:4000';
    const proto = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const serverUrl = `${proto}://${host}`;
    content = content.replace(/http:\/\/localhost:4000/g, serverUrl);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(content);
  }
  res.status(404).send('# agent.sh not found');
});

// REST API: Heartbeat & Node Registration
app.post(['/api/nodes/heartbeat', '/nodes/heartbeat'], (req: Request, res: Response) => {
  const { id, ip, status, totalEarnedUsdc, totalComputeSec, currentTask, gpu, vram, wallet } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing node ID' });

  const existing: NodeInfo = nodes.get(id) || {
    id,
    ip: ip || req.ip || '127.0.0.1',
    gpu: gpu || 'NVIDIA RTX 4080',
    vram: vram || '16GB',
    status: status || 'IDLE',
    wallet: wallet || 'FK4cdGVfnzqboHtkrNv3EPoP1eM3c6Gf1Ro1Sz3TVwKd',
    totalEarnedUsdc: 0,
    totalComputeSec: 0,
    lastHeartbeat: Date.now(),
    currentTask: currentTask || 'Idle (Zero-Lag Standby)',
  };

  if (gpu) existing.gpu = gpu;
  if (vram) existing.vram = vram;
  if (wallet) existing.wallet = wallet;
  if (status) existing.status = status;
  if (totalEarnedUsdc !== undefined) existing.totalEarnedUsdc = totalEarnedUsdc;
  if (totalComputeSec !== undefined) existing.totalComputeSec = totalComputeSec;
  if (currentTask !== undefined) existing.currentTask = currentTask;
  existing.lastHeartbeat = Date.now();

  nodes.set(id, existing);
  res.json({ success: true, node: existing });
});


// REST API: Submit Task
app.post(['/api/tasks/submit', '/tasks/submit'], (req: Request, res: Response) => {
  const { type, model, nodeId, nodeIds } = req.body;
  const targetIds: string[] = [];

  if (Array.isArray(nodeIds) && nodeIds.length > 0) {
    targetIds.push(...nodeIds);
  } else if (nodeId) {
    targetIds.push(nodeId);
  }

  if (targetIds.length > 0) {
    for (const id of targetIds) {
      const node = nodes.get(id);
      if (node) {
        node.status = 'COMPUTING';
        node.currentTask = `${type || 'PyTorch Inference'}: ${model || 'Llama-3.3-70B'}`;
      }
    }
    console.log(`[ORCHESTRATOR] ⚡ Started task on nodes: ${targetIds.join(', ')}`);
    return res.json({ success: true, assignedNodes: targetIds });
  }

  // Fallback: If no node specified, find IDLE nodes or pick first
  const idleNodes = Array.from(nodes.values()).filter((n) => n.status === 'IDLE');
  if (idleNodes.length > 0) {
    for (const node of idleNodes) {
      node.status = 'COMPUTING';
      node.currentTask = `${type || 'PyTorch Inference'}: ${model || 'Llama-3.3-70B'}`;
    }
    console.log(`[ORCHESTRATOR] ⚡ Started task on idle nodes: ${idleNodes.map((n) => n.id).join(', ')}`);
    return res.json({ success: true, assignedNodes: idleNodes.map((n) => n.id) });
  }

  const anyNode = Array.from(nodes.values())[0];
  if (anyNode) {
    anyNode.status = 'COMPUTING';
    anyNode.currentTask = `${type || 'PyTorch Inference'}: ${model || 'Llama-3.3-70B'}`;
  }
  return res.json({ success: true, assignedNodes: anyNode ? [anyNode.id] : [] });
});

// REST API: Update Wallet
app.post(['/api/nodes/wallet', '/nodes/wallet'], (req: Request, res: Response) => {
  const { id, wallet } = req.body;
  const node = nodes.get(id || 'NODE-AZURE-PC01');
  if (node && wallet) {
    node.wallet = wallet;
  }
  res.json({ success: true, wallet: node?.wallet });
});

// REST API: Stop Task (Kill-Switch)
app.post(['/api/tasks/stop', '/tasks/stop'], (req: Request, res: Response) => {
  const { nodeId, nodeIds } = req.body || {};
  const targetIds: string[] = [];

  if (Array.isArray(nodeIds) && nodeIds.length > 0) {
    targetIds.push(...nodeIds);
  } else if (nodeId) {
    targetIds.push(nodeId);
  }

  if (targetIds.length > 0) {
    for (const id of targetIds) {
      const node = nodes.get(id);
      if (node) {
        node.status = 'IDLE';
        node.currentTask = 'Idle (Zero-Lag Standby)';
      }
    }
    console.log(`[ORCHESTRATOR] 🛑 Stopped task on nodes: ${targetIds.join(', ')}`);
    return res.json({ success: true, stoppedNodes: targetIds });
  }

  for (const node of nodes.values()) {
    node.status = 'IDLE';
    node.currentTask = 'Idle (Zero-Lag Standby)';
  }
  console.log('[ORCHESTRATOR] 🛑 Stopped all tasks across network');
  res.json({ success: true });
});

// REST API: Transaction history
app.get(['/api/transactions', '/transactions'], (req: Request, res: Response) => {
  res.json({ transactions: txHistory });
});

// REST API: Clear transaction history / logs
app.post(['/api/transactions/clear', '/transactions/clear'], (req: Request, res: Response) => {
  txHistory.length = 0;
  console.log('[ORCHESTRATOR] 🗑️ Transactions history cleared.');
  res.json({ success: true, message: 'Transaction history cleared' });
});


// REST API: Wallet balance on Solana Devnet
app.get(['/api/balance/:address', '/balance/:address'], async (req: Request, res: Response) => {
  const balance = await getBalance(req.params.address as string);
  res.json({ address: req.params.address, balanceSol: balance });
});

// WebSockets
wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to TensorGrid Orchestrator' }));
});

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n==========================================================`);
    console.log(`⚡ TensorGrid Orchestrator running on http://localhost:${PORT}`);
    console.log(`📊 Open http://localhost:${PORT} in your browser for Live Dashboard`);
    console.log(`==========================================================\n`);
  });
}

export { app, server };
export default app;
