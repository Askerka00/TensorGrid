import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { WalletBar } from './components/WalletBar';
import { StatisticsCards } from './components/StatisticsCards';
import { NodesTable } from './components/NodesTable';
import { TransactionsTable } from './components/TransactionsTable';
import { ConnectNodePage } from './components/ConnectNodePage';
import {
  fetchNodesState,
  submitAiTask,
  stopAiTask,
  updateNodeWallet,
  clearTransactionsHistory,
} from './api';

import type { NodeInfo, PayoutResult, MetricCardData } from './types';

const defaultNode: NodeInfo = {
  id: 'NODE-AZURE-PC01',
  ip: '20.203.106.30',
  gpu: 'Standard B2ats (Emulated GPU)',
  vram: 'NVIDIA RTX 4080 (Mocked)',
  status: 'COMPUTING',
  wallet: 'FK4cdGVfnzqboHtkrNv3EPoP1eM3c6Gf1Ro1Sz3TVwKd',
  totalEarnedUsdc: 0.01472,
  totalComputeSec: 106,
  lastHeartbeat: Date.now(),
  currentTask: 'PyTorch: Llama-3.3-70B Batch Inference',
  selected: false,
};

export function App() {
  const [nodes, setNodes] = useState<NodeInfo[]>([defaultNode]);
  const [transactions, setTransactions] = useState<PayoutResult[]>([]);
  const [totalUsdc, setTotalUsdc] = useState(0.01472);
  const [showStatistics, setShowStatistics] = useState(true);
  const [activeSection, setActiveSection] = useState<'nodes' | 'payouts' | 'connect'>('nodes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const nodesRef = useRef<HTMLDivElement>(null);
  const payoutsRef = useRef<HTMLDivElement>(null);

  // Load and poll data from Orchestrator API
  const refreshData = useCallback(async () => {
    const data = await fetchNodesState();
    if (data && data.nodes && data.nodes.length > 0) {
      setNodes((prev) => {
        const selectedMap = new Map(prev.map((n) => [n.id, n.selected]));
        return data.nodes.map((node) => ({
          ...node,
          selected: !!selectedMap.get(node.id),
        }));
      });
      if (data.transactions) {
        setTransactions(data.transactions);
      }
      if (typeof data.totalUsdc === 'number') {
        setTotalUsdc(data.totalUsdc);
      }
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 1500);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Derived metrics
  const activeCount = nodes.filter((n) => n.status !== 'OFFLINE').length;
  const computingCount = nodes.filter((n) => n.status === 'COMPUTING').length;
  const currentWallet = nodes[0]?.wallet || 'FK4cdGVfnzqboHtkrNv3EPoP1eM3c6Gf1Ro1Sz3TVwKd';

  const metrics: MetricCardData[] = [
    {
      id: 'active-nodes',
      title: 'ACTIVE NODES',
      value: `${activeCount} / ${nodes.length}`,
      changeText: '+ 100% Uptime',
      changeType: 'positive',
    },
    {
      id: 'computing-nodes',
      title: 'ACTIVE TASKS',
      value: `${computingCount}`,
      changeText: computingCount > 0 ? 'Llama-3.3-70B' : 'IDLE',
      changeType: computingCount > 0 ? 'positive' : 'neutral',
    },
    {
      id: 'network-rate',
      title: 'NETWORK RATE',
      value: '$0.50 / hr',
      changeText: '70% to node owner ($0.35)',
      changeType: 'positive',
    },
    {
      id: 'total-earned',
      title: 'STREAMED EARNINGS',
      value: `$${totalUsdc.toFixed(5)}`,
      changeText: '+0.001 SOL streaming',
      changeType: 'positive',
    },
  ];

  // Handlers
  const handleToggleSelect = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, selected: !n.selected } : n))
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setNodes((prev) => prev.map((n) => ({ ...n, selected })));
  };

  const handleStartTask = async (targetNodeId?: string | string[]) => {
    let ids = targetNodeId;
    if (!ids) {
      const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id);
      if (selectedIds.length > 0) ids = selectedIds;
    }

    // Optimistically update matching node(s) in state so UI reflects immediately without lag
    setNodes((prev) =>
      prev.map((n) => {
        const matches = Array.isArray(ids)
          ? ids.includes(n.id)
          : ids
          ? n.id === ids
          : n.status === 'IDLE';
        if (matches) {
          return {
            ...n,
            status: 'COMPUTING',
            currentTask: 'PyTorch Inference: Llama-3.3-70B',
          };
        }
        return n;
      })
    );

    await submitAiTask('PyTorch Inference', 'Llama-3.3-70B', ids);
    await refreshData();
  };

  const handleStopTask = async (targetNodeId?: string | string[]) => {
    let ids = targetNodeId;
    if (!ids) {
      const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id);
      if (selectedIds.length > 0) ids = selectedIds;
    }

    // Optimistically update matching node(s) in state so UI reflects immediately without lag
    setNodes((prev) =>
      prev.map((n) => {
        const matches = Array.isArray(ids)
          ? ids.includes(n.id)
          : ids
          ? n.id === ids
          : true;
        if (matches) {
          return {
            ...n,
            status: 'IDLE',
            currentTask: 'Idle (Zero-Lag Standby)',
          };
        }
        return n;
      })
    );

    await stopAiTask(ids);
    await refreshData();
  };

  const handleSaveWallet = async (wallet: string) => {
    const res = await updateNodeWallet('NODE-AZURE-PC01', wallet);
    await refreshData();
    return !!res;
  };

  const handleClearHistory = async () => {
    await clearTransactionsHistory();
    setTransactions([]);
    await refreshData();
  };


  const handleSelectSection = (section: string) => {
    if (section === 'connect') {
      setActiveSection('connect');
    } else {
      setActiveSection('nodes');
      if (section === 'payouts' && payoutsRef.current) {
        setTimeout(() => {
          payoutsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else if (section === 'nodes' && nodesRef.current) {
        setTimeout(() => {
          nodesRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen flex overflow-hidden bg-[#fafafc]">
      {/* Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        txCount={transactions.length}
      />

      {/* Main Content Area: View switcher */}
      {activeSection === 'connect' ? (
        <ConnectNodePage
          onBackToDashboard={() => setActiveSection('nodes')}
          defaultWallet={currentWallet}
          onNodeRegistered={refreshData}
        />
      ) : (
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#fafafc]">
          {/* Top Header */}
          <Header
            title="TensorGrid Orchestrator"
            subtitle="Decentralized GPU sharing for AI compute and 3D rendering"
            onCustomizeWidget={() => setShowStatistics((prev) => !prev)}
          />

          {/* Action Controls Bar */}
          <FilterBar
            showStatistics={showStatistics}
            onToggleStatistics={() => setShowStatistics(!showStatistics)}
            onStartTask={handleStartTask}
            onStopTask={handleStopTask}
            onRefresh={refreshData}
            onConnectNode={() => setActiveSection('connect')}
            computing={computingCount > 0}
          />

          {/* 4 KPI Statistics Cards */}
          {showStatistics && <StatisticsCards metrics={metrics} />}

          {/* Solana Wallet Management Bar */}
          <WalletBar
            currentWallet={currentWallet}
            onSaveWallet={handleSaveWallet}
          />

          {/* Table 1: Connected Nodes */}
          <div ref={nodesRef}>
            <div className="px-6 pt-2 pb-1">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Connected Compute Nodes</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {nodes.length} online
                </span>
              </h2>
            </div>
            <NodesTable
              nodes={nodes}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onStartTaskOnNode={handleStartTask}
              onStopTaskOnNode={handleStopTask}
              onConnectNode={() => setActiveSection('connect')}
            />
          </div>

          {/* Table 2: Solana Devnet Real Transactions */}
          <div ref={payoutsRef}>
            <TransactionsTable
              transactions={transactions}
              onClearHistory={handleClearHistory}
            />
          </div>

        </main>
      )}
    </div>
  );
}

export default App;
