import React from 'react';
import { Sparkles, Bell, UserPlus, SlidersHorizontal, Radio } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onCustomizeWidget?: () => void;
  networkOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Connected Compute Nodes',
  subtitle = 'Decentralized GPU & CPU compute network for AI inference and rendering',
  onCustomizeWidget,
  networkOnline = true,
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-3.5 px-6 border-b border-gray-100 bg-white flex-shrink-0">
      {/* Title & Subtitle */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 truncate">
            {title}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs ${
              networkOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                networkOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span>{networkOnline ? 'Online (Solana Devnet)' : 'Offline'}</span>
          </span>

        </div>
        <p className="text-xs text-gray-400 font-normal mt-0.5 truncate">
          {subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Network Rate Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 text-xs font-semibold text-gray-700">
          <Radio className="w-3.5 h-3.5 text-[#ff6422]" />
          <span>Rate: $0.50 / hr</span>
        </div>

        {/* AI Assistant */}
        <button
          title="AI Task Assistant"
          className="w-9 h-9 rounded-xl border border-gray-200/90 bg-white flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-2xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-gray-500" />
        </button>

        {/* Notification Bell */}
        <button
          title="Transaction Notifications"
          className="relative w-9 h-9 rounded-xl border border-gray-200/90 bg-white flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-2xs cursor-pointer"
        >
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#ff6422] rounded-full ring-2 ring-white" />
        </button>

        {/* Avatar Stack of active node operators */}
        <div className="flex items-center -space-x-2 ml-1">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
            alt="Node Operator 1"
            className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs"
          />
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
            alt="Node Operator 2"
            className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs"
          />
          <div className="relative z-10 w-7 h-7 rounded-full bg-[#fdeee7] text-[#ff6422] border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
            +1
          </div>
        </div>

        {/* Add Node / Member */}
        <button
          title="Add Node to Cluster"
          className="w-8 h-8 rounded-full border border-gray-200/90 bg-white flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all shadow-2xs cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
        </button>

        {/* Customize Widget */}
        <button
          onClick={onCustomizeWidget}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200/90 bg-white text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-2xs ml-1 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
          <span className="hidden md:inline">Customize Widgets</span>
        </button>
      </div>
    </header>
  );
};
