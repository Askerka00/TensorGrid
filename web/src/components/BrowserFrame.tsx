import React from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Link as LinkIcon, Share2, Plus, Layout } from 'lucide-react';

interface BrowserFrameProps {
  children: React.ReactNode;
  url?: string;
  enableFrame?: boolean;
  onToggleFrame?: () => void;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  children,
  url = 'uxerflow.orbit.com',
  enableFrame = true,
  onToggleFrame,
}) => {
  if (!enableFrame) {
    return <div className="min-h-screen bg-[#eceef0]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#eceef0] p-3 md:p-6 lg:p-8 flex flex-col items-center justify-center">
      {/* Frame Container */}
      <div className="w-full max-w-[1440px] bg-white rounded-2xl shadow-2xl border border-gray-300/80 overflow-hidden flex flex-col transition-all">
        {/* Top Browser Navigation Bar */}
        <div className="bg-[#fcfcfd] border-b border-gray-200/90 px-4 py-2.5 flex items-center justify-between gap-4 select-none">
          {/* Left navigation arrows */}
          <div className="flex items-center gap-2 text-gray-400">
            <button
              title="Back"
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              title="Forward"
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              title="Refresh"
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Centered URL Bar */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 bg-[#f4f5f7]/80 hover:bg-white border border-gray-200/80 rounded-xl px-3 py-1 text-xs text-gray-700 transition-all cursor-text shadow-2xs">
              <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-mono text-gray-600 text-[11px] truncate">
                {url}
              </span>
            </div>
          </div>

          {/* Right browser buttons & toggle frame button */}
          <div className="flex items-center gap-1.5 text-gray-400">
            <button
              title="Share"
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              title="New Tab"
              className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {onToggleFrame && (
              <button
                onClick={onToggleFrame}
                title="Toggle Fullscreen View"
                className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors ml-1"
              >
                <Layout className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Browser Viewport Content */}
        <div className="w-full flex-1 overflow-x-hidden bg-[#fafafb]">
          {children}
        </div>
      </div>
    </div>
  );
};
