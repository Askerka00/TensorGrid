import React from 'react';
import {
  Zap,
  ShieldAlert,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface FilterBarProps {
  showStatistics: boolean;
  onToggleStatistics: () => void;
  onStartTask: () => void;
  onStopTask: () => void;
  onRefresh: () => void;
  onConnectNode: () => void;
  computing: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  showStatistics,
  onToggleStatistics,
  onStartTask,
  onStopTask,
  onRefresh,
  onConnectNode,
  computing,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
      {/* Left controls: Quick status & Statistics Toggle */}
      <div className="flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          title="Refresh network state"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200/90 bg-white text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>Refresh</span>
        </button>

        {/* Show Statistics Toggle */}
        <div
          onClick={onToggleStatistics}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <span className="text-xs font-semibold text-gray-700">
            Network Metrics
          </span>
          <div
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
              showStatistics ? 'bg-[#ff6422]' : 'bg-gray-200'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                showStatistics ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Right controls: Task actions & Add node */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Start AI Task Button */}
        <button
          type="button"
          onClick={onStartTask}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold transition-all shadow-xs bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer"
        >
          <Zap className={`w-3.5 h-3.5 fill-white ${computing ? 'animate-pulse' : ''}`} />
          <span>
            {computing
              ? '⚡ Dispatch Additional Task ($USDC Streaming)'
              : 'Dispatch AI Task ($USDC Streaming)'}
          </span>
        </button>

        {/* Kill-Switch Button */}
        <button
          onClick={onStopTask}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50/80 hover:bg-red-100 text-red-700 text-xs font-semibold transition-all shadow-2xs"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          <span>Stop Task (Kill-Switch)</span>
        </button>

        {/* Add Node Button */}
        <button
          onClick={onConnectNode}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Connect Node</span>
        </button>
      </div>
    </div>
  );
};
