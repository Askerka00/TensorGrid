const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory state for serverless execution
const nodes = new Map();
const txHistory = [
  {
    success: true,
    signature: '5x744XeH4uD4YEdT87pk3fjU7dPLNWxAMVg2BqdYBsy2xX482bFBSTNhVY5bjrQWiUowSdbSBaaNJfWBEEsUzqaq',
    amountLamports: 1000000,
    amountSol: 0.001,
    recipient: 'FK4cdGVfnzqboHtkrNv3EPoP1eM3c6Gf1Ro1Sz3TVwKd',
    explorerUrl: 'https://explorer.solana.com/tx/5x744XeH4uD4YEdT87pk3fjU7dPLNWxAMVg2BqdYBsy2xX482bFBSTNhVY5bjrQWiUowSdbSBaaNJfWBEEsUzqaq?cluster=devnet'
  },
  {
    success: true,
    signature: '3Jpd6wpLheTAmb5NK29wKZTogCf1cbEMb4ixXrP7k9bWhaPoJvWhnBDhse1P72puxrDwFeesV3nGEQaXyk2ZKTvk',
    amountLamports: 1000000,
    amountSol: 0.001,
    recipient: 'FK4cdGVfnzqboHtkrNv3EPoP1eM3c6Gf1Ro1Sz3TVwKd',
    explorerUrl: 'https://explorer.solana.com/tx/3Jpd6wpLheTAmb5NK29wKZTogCf1cbEMb4ixXrP7k9bWhaPoJvWhnBDhse1P72puxrDwFeesV3nGEQaXyk2ZKTvk?cluster=devnet'
  }
];

// Initialize default node
nodes.set('NODE-AZURE-PC01', {
  id: 'NODE-AZURE-PC01',
  ip: '20.203.106.30',
  gpu: 'Standard B2ats (Emulated GPU)',
  vram: 'NVIDIA RTX 4080 (Mocked)',
  status: 'COMPUTING',
  wallet: 'FK4cdGVfnzqboHtkrNv3EPoP1eM3c6Gf1Ro1Sz3TVwKd',
  totalEarnedUsdc: 0.0542,
  totalComputeSec: 390,
  lastHeartbeat: Date.now(),
  currentTask: 'PyTorch: Llama-3.3-70B Batch Inference',
  startedAt: Date.now() - 390000,
});

// REST API: Get nodes state
app.get(['/api/nodes', '/nodes'], (req, res) => {
  const now = Date.now();
  for (const node of nodes.values()) {
    if (node.status === 'COMPUTING') {
      if (!node.startedAt) node.startedAt = now - (node.totalComputeSec * 1000);
      const elapsedSec = Math.floor((now - node.startedAt) / 1000);
      node.totalComputeSec = Math.max(node.totalComputeSec, elapsedSec);
      node.totalEarnedUsdc = node.totalComputeSec * (0.50 / 3600.0);
    }
  }

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

// REST API: Node Heartbeat / Registration
app.post(['/api/nodes/heartbeat', '/nodes/heartbeat'], (req, res) => {
  const { id, ip, status, totalEarnedUsdc, totalComputeSec, currentTask, gpu, vram, wallet } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing node ID' });

  const existing = nodes.get(id) || {
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
app.post(['/api/tasks/submit', '/tasks/submit'], (req, res) => {
  const { type, model, nodeId, nodeIds } = req.body || {};
  const targetIds = [];

  if (Array.isArray(nodeIds) && nodeIds.length > 0) {
    targetIds.push(...nodeIds);
  } else if (nodeId) {
    targetIds.push(nodeId);
  }

  const now = Date.now();
  if (targetIds.length > 0) {
    for (const id of targetIds) {
      const node = nodes.get(id);
      if (node) {
        node.status = 'COMPUTING';
        node.currentTask = `${type || 'PyTorch Inference'}: ${model || 'Llama-3.3-70B'}`;
        node.startedAt = now - (node.totalComputeSec * 1000);
      }
    }
    return res.json({ success: true, assignedNodes: targetIds });
  }

  // Fallback: If no node specified, find IDLE nodes or pick first
  const idleNodes = Array.from(nodes.values()).filter((n) => n.status === 'IDLE');
  if (idleNodes.length > 0) {
    for (const node of idleNodes) {
      node.status = 'COMPUTING';
      node.currentTask = `${type || 'PyTorch Inference'}: ${model || 'Llama-3.3-70B'}`;
      node.startedAt = now - (node.totalComputeSec * 1000);
    }
    return res.json({ success: true, assignedNodes: idleNodes.map((n) => n.id) });
  }

  const anyNode = Array.from(nodes.values())[0];
  if (anyNode) {
    anyNode.status = 'COMPUTING';
    anyNode.currentTask = `${type || 'PyTorch Inference'}: ${model || 'Llama-3.3-70B'}`;
    anyNode.startedAt = now - (anyNode.totalComputeSec * 1000);
  }
  return res.json({ success: true, assignedNodes: anyNode ? [anyNode.id] : [] });
});

// REST API: Stop Task (Kill-Switch)
app.post(['/api/tasks/stop', '/tasks/stop'], (req, res) => {
  const { nodeId, nodeIds } = req.body || {};
  const targetIds = [];

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
    return res.json({ success: true, stoppedNodes: targetIds });
  }

  for (const node of nodes.values()) {
    node.status = 'IDLE';
    node.currentTask = 'Idle (Zero-Lag Standby)';
  }
  res.json({ success: true });
});

// REST API: Update Wallet
app.post(['/api/nodes/wallet', '/nodes/wallet'], (req, res) => {
  const { id, wallet } = req.body || {};
  const node = nodes.get(id || 'NODE-AZURE-PC01');
  if (node && wallet) {
    node.wallet = wallet;
  }
  res.json({ success: true, wallet: node?.wallet });
});

// REST API: Transactions history
app.get(['/api/transactions', '/transactions'], (req, res) => {
  res.json({ transactions: txHistory });
});

// REST API: Clear transactions
app.post(['/api/transactions/clear', '/transactions/clear'], (req, res) => {
  txHistory.length = 0;
  res.json({ success: true, message: 'Transaction history cleared' });
});

// REST API: Balance
app.get(['/api/balance/:address', '/balance/:address'], (req, res) => {
  res.json({ address: req.params.address, balanceSol: 1.45 });
});

// Serve agent.ps1 dynamically
app.get(['/agent.ps1', '/api/agent.ps1'], (req, res) => {
  const host = req.get('host') || 'tensorgrid.vercel.app';
  const proto = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const serverUrl = `${proto}://${host}`;

  try {
    const localAgent = path.resolve(process.cwd(), 'agent.ps1');
    if (fs.existsSync(localAgent)) {
      let content = fs.readFileSync(localAgent, 'utf8');
      content = content.replace(/http:\/\/localhost:4000/g, serverUrl);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(content);
    }
  } catch {}

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`# TensorGrid Client Agent\n$Orchestrator = "${serverUrl}"\nWrite-Host "Connected to ${serverUrl}"\n`);
});

// Serve agent.sh dynamically
app.get(['/agent.sh', '/api/agent.sh'], (req, res) => {
  const host = req.get('host') || 'tensorgrid.vercel.app';
  const proto = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const serverUrl = `${proto}://${host}`;

  try {
    const localAgent = path.resolve(process.cwd(), 'agent.sh');
    if (fs.existsSync(localAgent)) {
      let content = fs.readFileSync(localAgent, 'utf8');
      content = content.replace(/http:\/\/localhost:4000/g, serverUrl);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(content);
    }
  } catch {}

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`#!/usr/bin/env bash\necho "Connecting to ${serverUrl}..."\n`);
});

module.exports = app;
