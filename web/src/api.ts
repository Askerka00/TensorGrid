import type { NodeInfo, PayoutResult } from './types';

// If running in dev mode on vite (port 5173), target port 4000; if served from server, use ''
const API_BASE = window.location.port === '5173' ? 'http://localhost:4000' : '';

export interface ApiResponse {
  nodes: NodeInfo[];
  activeNodes: number;
  computingNodes: number;
  totalUsdc: number;
  transactions: PayoutResult[];
}

export async function fetchNodesState(): Promise<ApiResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/nodes`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('API fetch error, falling back to local simulation:', e);
    return null;
  }
}

export async function submitAiTask(
  type = 'PyTorch Inference',
  model = 'Llama-3.3-70B',
  nodeIds?: string | string[]
) {
  try {
    const payload: Record<string, any> = { type, model };
    if (Array.isArray(nodeIds)) {
      payload.nodeIds = nodeIds;
    } else if (typeof nodeIds === 'string') {
      payload.nodeId = nodeIds;
    }

    const res = await fetch(`${API_BASE}/api/tasks/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to submit task:', e);
    return null;
  }
}

export async function stopAiTask(nodeIds?: string | string[]) {
  try {
    const payload: Record<string, any> = {};
    if (Array.isArray(nodeIds)) {
      payload.nodeIds = nodeIds;
    } else if (typeof nodeIds === 'string') {
      payload.nodeId = nodeIds;
    }

    const res = await fetch(`${API_BASE}/api/tasks/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to stop task:', e);
    return null;
  }
}

export async function updateNodeWallet(id: string, wallet: string) {
  try {
    const res = await fetch(`${API_BASE}/api/nodes/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, wallet }),
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to update wallet:', e);
    return null;
  }
}

export async function registerNode(nodeData: Partial<NodeInfo>) {
  try {
    const res = await fetch(`${API_BASE}/api/nodes/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nodeData),
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to register node:', e);
    return null;
  }
}

export async function clearTransactionsHistory() {
  try {
    const res = await fetch(`${API_BASE}/api/transactions/clear`, {
      method: 'POST',
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to clear transactions:', e);
    return null;
  }
}
