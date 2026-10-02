"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 4000;
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const nodes = new Map();
// Инициализируем наш Azure PC-01 как зарегистрированную ноду
nodes.set('NODE-AZURE-PC01', {
    id: 'NODE-AZURE-PC01',
    ip: '20.203.106.30',
    gpu: 'Standard B2ats (Emulated GPU)',
    vram: 'NVIDIA RTX 4080 (Mocked)',
    status: 'COMPUTING',
    wallet: '46xHyUg3GnUZhBxvTCrSF1CGu59qQKgTRB6Sw8RyYh9L',
    totalEarnedUsdc: 0.0028,
    totalComputeSec: 20,
    lastHeartbeat: Date.now(),
    currentTask: 'PyTorch: Llama-3.3-70B Batch Inference',
});
// Фоновый таймер стриминга начислений в $USDC
const RATE_PER_SEC = 0.50 / 3600.0;
setInterval(() => {
    for (const node of nodes.values()) {
        if (node.status === 'COMPUTING') {
            node.totalComputeSec += 1;
            node.totalEarnedUsdc += RATE_PER_SEC;
        }
    }
}, 1000);
// HTML Дашборд для наглядного мониторинга сети в браузере
app.get('/', (req, res) => {
    const nodeList = Array.from(nodes.values());
    const activeNodes = nodeList.filter(n => n.status !== 'OFFLINE').length;
    const computingNodes = nodeList.filter(n => n.status === 'COMPUTING').length;
    const totalUsdc = nodeList.reduce((acc, n) => acc + n.totalEarnedUsdc, 0);
    const html = `
<!DOCTYPE html>
<html lang="ru">
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
  <div class="subtitle">Децентрализованный шеринг GPU для вычислений ИИ и 3D-рендеринга</div>

  <div class="stats-grid">
    <div class="card">
      <div class="card-title">Активные ноды</div>
      <div class="card-val">${activeNodes} / ${nodeList.length}</div>
    </div>
    <div class="card">
      <div class="card-title">Выполняют задачи</div>
      <div class="card-val" style="color: #3fb950;">${computingNodes}</div>
    </div>
    <div class="card">
      <div class="card-title">Ставка сети</div>
      <div class="card-val">$0.50 / ч</div>
    </div>
    <div class="card">
      <div class="card-title">Выплачено в $USDC</div>
      <div class="card-val" style="color: #f1e05a;">$${totalUsdc.toFixed(5)}</div>
    </div>
  </div>

  <div class="card" style="margin-bottom: 24px;">
    <div class="card-title">👛 Привязать кошелек Solana для выплат (Phantom / Solflare)</div>
    <div style="display: flex; gap: 10px; margin-top: 10px;">
      <input id="walletInput" type="text" placeholder="Введи публичный адрес кошелька Solana (например, из Phantom)..." value="${nodeList[0]?.wallet || ''}" style="flex: 1; padding: 10px 14px; background: #0d1117; border: 1px solid #30363d; color: #58a6ff; font-weight: 600; border-radius: 6px; font-family: monospace; font-size: 14px;" />
      <button class="btn btn-green" onclick="fetch('/api/nodes/wallet', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:'NODE-AZURE-PC01', wallet: document.getElementById('walletInput').value})}).then(()=>location.reload())">💾 Сохранить кошелек</button>
    </div>
  </div>

  <div class="controls">
    <button class="btn btn-green" onclick="fetch('/api/tasks/submit', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'AI Inference', model:'Llama-3.3-70B'})}).then(()=>location.reload())">
      ⚡ Запустить AI-задачу ($USDC Streaming)
    </button>
    <button class="btn btn-red" onclick="fetch('/api/tasks/stop', {method:'POST'}).then(()=>location.reload())">
      🛑 Сбросить задачу (Kill-Switch / IDLE)
    </button>
  </div>

  <h2>Подключенные вычислительные узлы (Nodes)</h2>
  <table>
    <thead>
      <tr>
        <th>ID Ноды</th>
        <th>IP-адрес</th>
        <th>Железо / Видеокарта</th>
        <th>Статус</th>
        <th>Текущая задача</th>
        <th>Выработано</th>
        <th>Баланс кошелька</th>
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
          <td>${n.currentTask || 'Ожидание простоя системы'}</td>
          <td>${n.totalComputeSec} сек</td>
          <td style="color: #3fb950; font-weight: bold;">$${n.totalEarnedUsdc.toFixed(5)} USDC</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;
    res.send(html);
});
// REST API: Heartbeat
app.post('/api/nodes/heartbeat', (req, res) => {
    const { id, ip, status, totalEarnedUsdc, totalComputeSec, currentTask } = req.body;
    if (!id)
        return res.status(400).json({ error: 'Missing node ID' });
    const existing = nodes.get(id) || {
        id,
        ip: ip || req.ip || 'unknown',
        gpu: 'RTX 4080',
        vram: '16GB',
        status: 'IDLE',
        wallet: 'Solana Devnet Wallet',
        totalEarnedUsdc: 0,
        totalComputeSec: 0,
        lastHeartbeat: Date.now(),
        currentTask: undefined,
    };
    existing.status = status || existing.status;
    if (totalEarnedUsdc !== undefined)
        existing.totalEarnedUsdc = totalEarnedUsdc;
    if (totalComputeSec !== undefined)
        existing.totalComputeSec = totalComputeSec;
    if (currentTask !== undefined)
        existing.currentTask = currentTask;
    existing.lastHeartbeat = Date.now();
    nodes.set(id, existing);
    res.json({ success: true, node: existing });
});
// REST API: Submit Task
app.post('/api/tasks/submit', (req, res) => {
    const { type, model } = req.body;
    const node = nodes.get('NODE-AZURE-PC01') || Array.from(nodes.values())[0];
    if (node) {
        node.status = 'COMPUTING';
        node.currentTask = `${type || 'Inference'}: ${model || 'Llama-3.3-70B'}`;
    }
    res.json({ success: true, assignedNode: node?.id });
});
// REST API: Update Wallet
app.post('/api/nodes/wallet', (req, res) => {
    const { id, wallet } = req.body;
    const node = nodes.get(id || 'NODE-AZURE-PC01');
    if (node && wallet) {
        node.wallet = wallet;
    }
    res.json({ success: true, wallet: node?.wallet });
});
// REST API: Stop Task (Kill-Switch)
app.post('/api/tasks/stop', (req, res) => {
    for (const node of nodes.values()) {
        node.status = 'IDLE';
        node.currentTask = 'Ожидание простоя системы';
    }
    res.json({ success: true });
});
// WebSockets
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to TensorGrid Orchestrator' }));
});
server.listen(PORT, () => {
    console.log(`\n==========================================================`);
    console.log(`⚡ TensorGrid Orchestrator running on http://localhost:${PORT}`);
    console.log(`📊 Open http://localhost:${PORT} in your browser for Live Dashboard`);
    console.log(`==========================================================\n`);
});
