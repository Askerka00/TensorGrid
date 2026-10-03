import React, { useState } from 'react';
import {
  Plus,
  Zap,
  ShieldAlert,
  Copy,
  ExternalLink,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { NodeInfo } from '../types';

interface NodesTableProps {
  nodes: NodeInfo[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onStartTaskOnNode: (id: string | string[]) => void;
  onStopTaskOnNode: (id: string | string[]) => void;
  onConnectNode?: () => void;
}

export const NodesTable: React.FC<NodesTableProps> = ({
  nodes,
  onToggleSelect,
  onSelectAll,
  onStartTaskOnNode,
  onStopTaskOnNode,
  onConnectNode,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedCount = nodes.filter((n) => n.selected).length;
  const allSelected = nodes.length > 0 && selectedCount === nodes.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < nodes.length;

  const handleCopyIp = (ip: string, id: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderStatusBadge = (node: NodeInfo) => {
    switch (node.status) {
      case 'COMPUTING':
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStopTaskOnNode(node.id);
            }}
            title="Click to terminate task (Kill-Switch)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>⚡ COMPUTING</span>
          </button>
        );
      case 'IDLE':
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartTaskOnNode(node.id);
            }}
            title="Click to start task on this node"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <span>💤 IDLE (Click to run)</span>
          </button>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-500">
            <span>🔴 OFFLINE</span>
          </span>
        );
    }
  };

  return (
    <div className="px-6 py-2 pb-8">
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs relative flex flex-col">
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            {/* Header */}
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-white">
                <th className="py-3 px-4 w-12 text-center">
                  <div
                    onClick={() => onSelectAll(!allSelected)}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors mx-auto ${
                      allSelected || isIndeterminate
                        ? 'bg-[#ff6422] border-[#ff6422] text-white'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    {isIndeterminate && <Minus className="w-3 h-3 stroke-[3]" />}
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Node ID</th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-4 font-semibold">Hardware / GPU</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Current Task</th>
                <th className="py-3 px-4 font-semibold">Compute Time</th>
                <th className="py-3 px-4 font-semibold">Earned</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-100 text-xs">
              {nodes.map((node) => {
                const isSelected = !!node.selected;
                return (
                  <tr
                    key={node.id}
                    onClick={() => onToggleSelect(node.id)}
                    className={`transition-colors cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#fff7f2] hover:bg-[#fff3eb]'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center relative">
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6422]" />
                      )}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(node.id);
                        }}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors mx-auto ${
                          isSelected
                            ? 'bg-[#ff6422] border-[#ff6422] text-white'
                            : 'border-gray-300 group-hover:border-gray-400 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </td>

                    {/* Node ID */}
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {node.id}
                    </td>

                    {/* IP Address */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-gray-600">
                        <span>{node.ip}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyIp(node.ip, node.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-gray-700 transition-opacity cursor-pointer"
                          title="Copy IP"
                        >
                          {copiedId === node.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Hardware / GPU */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      <span>{node.gpu}</span>
                      <span className="text-gray-400 ml-1">({node.vram})</span>
                    </td>

                    {/* Status Badge (Clickable Toggle) */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(node)}
                    </td>

                    {/* Current Task */}
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {node.currentTask || (
                        <span className="text-gray-400 font-normal">
                          Idle (Zero-Lag Standby)
                        </span>
                      )}
                    </td>

                    {/* Total compute time */}
                    <td className="py-3.5 px-4 font-semibold text-gray-700 font-mono">
                      {node.totalComputeSec}s
                    </td>

                    {/* Earned Balance */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600 font-mono">
                        ${node.totalEarnedUsdc.toFixed(5)} USDC
                      </span>
                    </td>

                    {/* Direct Row Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      {node.status === 'IDLE' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartTaskOnNode(node.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                          <Zap className="w-3 h-3 fill-white" />
                          <span>Start</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStopTaskOnNode(node.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 text-[11px] font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                          <ShieldAlert className="w-3 h-3 text-red-600" />
                          <span>Stop</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Node link below rows */}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onConnectNode}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect additional compute node (PC / Mac / CPU)</span>
          </button>
          <span className="text-xs text-gray-400 font-mono">
            Live telemetry: every 1.5s
          </span>
        </div>

        {/* Floating Action Pill Bar for Selected Nodes */}
        {selectedCount > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-xl rounded-2xl px-4 py-2 flex items-center gap-3 text-xs text-gray-700">
              <span className="font-bold text-gray-900 whitespace-nowrap">
                {selectedCount} selected
              </span>

              <div className="w-[1px] h-4 bg-gray-200" />

              {/* Start Task on Selected Nodes */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id);
                  if (selectedIds.length > 0) {
                    onStartTaskOnNode(selectedIds);
                  }
                }}
                className="flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 fill-emerald-600" />
                <span>Start Task</span>
              </button>

              {/* Stop Task (Kill-Switch) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id);
                  if (selectedIds.length > 0) {
                    onStopTaskOnNode(selectedIds);
                  }
                }}
                className="flex items-center gap-1.5 font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>Stop (Kill-Switch)</span>
              </button>

              {/* Solana Explorer */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const sel = nodes.find((n) => n.selected);
                  if (sel?.wallet) {
                    window.open(
                      `https://explorer.solana.com/address/${sel.wallet}?cluster=devnet`,
                      '_blank'
                    );
                  }
                }}
                className="flex items-center gap-1.5 font-semibold text-blue-700 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Solana Explorer</span>
              </button>

              <div className="w-[1px] h-4 bg-gray-200" />

              {/* Clear selection */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectAll(false);
                }}
                title="Clear selection"
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Showing per page */}
          <div className="flex items-center gap-2 text-gray-500">
            <span>Per page</span>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-200/90 rounded-lg px-2.5 py-1 pr-6 font-semibold text-gray-800 outline-none cursor-pointer hover:border-gray-300"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Page numbers */}
          <div className="flex items-center gap-1 text-gray-600">
            <button
              onClick={() => setCurrentPage(1)}
              title="First"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentPage(currentPage)}
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold bg-[#ff6422] text-white shadow-2xs"
            >
              {currentPage}
            </button>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              title="Next"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              title="Last"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Go to page */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <span>Page</span>
            <input
              type="text"
              value={goToPageInput}
              onChange={(e) => setGoToPageInput(e.target.value)}
              placeholder="1"
              className="w-10 h-7 text-center border border-gray-200/90 rounded-lg outline-none font-medium text-gray-800 focus:border-gray-400"
            />
            <button
              onClick={() => {
                const p = parseInt(goToPageInput);
                if (p >= 1) setCurrentPage(p);
              }}
              className="flex items-center gap-0.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200/90 rounded-lg font-semibold text-gray-700 transition-colors cursor-pointer"
            >
              <span>Go</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
