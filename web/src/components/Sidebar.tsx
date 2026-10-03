import React from 'react';
import {
  Cpu,
  Coins,
  ExternalLink,
  HelpCircle,
  Settings,
  Rocket,
  ChevronRight,
  ShieldCheck,
  ChevronsLeft,
  Laptop,
} from 'lucide-react';
import { TensorGridLogo } from './TensorGridLogo';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  txCount?: number;
  activeSection?: string;
  onSelectSection?: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  txCount = 0,
  activeSection = 'nodes',
  onSelectSection,
}) => {
  return (
    <aside
      className={`bg-white border-r border-[#eceef0] flex flex-col justify-between transition-all duration-300 relative select-none z-20 flex-shrink-0 ${
        collapsed ? 'w-20' : 'w-[245px]'
      } h-screen`}
    >
      {/* Top Section */}
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Workspace / Company Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <TensorGridLogo size={36} variant="icon-gradient" />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-900 text-sm tracking-tight truncate leading-tight">
                  TensorGrid
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-gray-400 font-medium leading-none">
                    Solana Devnet
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand' : 'Collapse'}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center flex-shrink-0"
          >
            <ChevronsLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation Menus */}
        <div className="px-2.5 py-3 space-y-4 overflow-y-auto flex-1">
          <div>
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                Orchestrator
              </div>
            )}
            <nav className="space-y-1">
              {/* Nodes (Active default) */}
              <div className="relative">
                {activeSection === 'nodes' && (
                  <span className="absolute -left-2.5 top-1 bottom-1 w-1 bg-[#ff6422] rounded-r-md" />
                )}
                <button
                  onClick={() => onSelectSection && onSelectSection('nodes')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'nodes'
                      ? 'text-gray-950 bg-[#f4f5f8]/90 font-semibold shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Cpu className={`w-4 h-4 flex-shrink-0 ${activeSection === 'nodes' ? 'text-gray-900' : 'text-gray-500'}`} />
                    {!collapsed && <span>Compute Nodes</span>}
                  </div>
                  {!collapsed && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      1 / 1
                    </span>
                  )}
                </button>
              </div>

              {/* Connect PC (New prominent page) */}
              <div className="relative">
                {activeSection === 'connect' && (
                  <span className="absolute -left-2.5 top-1 bottom-1 w-1 bg-[#ff6422] rounded-r-md" />
                )}
                <button
                  onClick={() => onSelectSection && onSelectSection('connect')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'connect'
                      ? 'text-gray-950 bg-[#f4f5f8]/90 font-semibold shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Laptop className={`w-4 h-4 flex-shrink-0 ${activeSection === 'connect' ? 'text-[#ff6422]' : 'text-gray-500'}`} />
                    {!collapsed && <span className="font-semibold">Connect My Node</span>}
                  </div>
                  {!collapsed && (
                    <span className="bg-[#ff6422]/10 text-[#ff6422] text-[10px] font-bold px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  )}
                </button>
              </div>

              {/* Solana Payouts */}
              <div className="relative">
                {activeSection === 'payouts' && (
                  <span className="absolute -left-2.5 top-1 bottom-1 w-1 bg-[#ff6422] rounded-r-md" />
                )}
                <button
                  onClick={() => onSelectSection && onSelectSection('payouts')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === 'payouts'
                      ? 'text-gray-950 bg-[#f4f5f8]/90 font-semibold shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Coins className={`w-4 h-4 flex-shrink-0 ${activeSection === 'payouts' ? 'text-gray-900' : 'text-gray-500'}`} />
                    {!collapsed && <span>SOL Payout History</span>}
                  </div>
                  {!collapsed && txCount > 0 && (
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {txCount}
                    </span>
                  )}
                </button>
              </div>
            </nav>
          </div>

          <div>
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                Solana Network
              </div>
            )}
            <nav className="space-y-1">
              <a
                href="https://explorer.solana.com/?cluster=devnet"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {!collapsed && <span>Solana Explorer</span>}
                </div>
                {!collapsed && (
                  <span className="text-[10px] text-gray-400 font-mono">Devnet</span>
                )}
              </a>

              <div className="px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {!collapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-gray-800 leading-tight">
                      Proof-of-Computation
                    </span>
                    <span className="text-[10px] text-gray-400 leading-tight">
                      Zero-Lag Sandbox Active
                    </span>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-100 space-y-2.5 flex-shrink-0 bg-white">
        <nav className="space-y-0.5 px-0.5">
          <a
            href="https://github.com/Askerka00/TensorGrid"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {!collapsed && <span>GitHub Documentation</span>}
          </a>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
            <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {!collapsed && <span>Node Settings</span>}
          </button>
        </nav>

        {/* Upgrade Card / Connect Worker */}
        {!collapsed && (
          <div
            onClick={() => onSelectSection && onSelectSection('connect')}
            className="border border-orange-200/60 bg-gradient-to-r from-orange-50/70 to-amber-50/50 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer hover:shadow-xs transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-[#ff6422] flex items-center justify-center text-white flex-shrink-0 shadow-2xs">
                <Rocket className="w-3.5 h-3.5 fill-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-gray-800 leading-tight">
                  Connect GPU / Worker
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  Windows / Docker Agent
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </div>
        )}
      </div>
    </aside>
  );
};
