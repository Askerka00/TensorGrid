import React from 'react';
import { Info } from 'lucide-react';
import type { MetricCardData } from '../types';

interface StatisticsCardsProps {
  metrics: MetricCardData[];
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ metrics }) => {
  return (
    <div className="px-6 py-2">
      <div className="bg-white border border-gray-200/90 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 shadow-2xs">
        {metrics.map((metric) => (
          <div key={metric.id} className="p-4 flex flex-col justify-between">
            {/* Header: Title + Info icon */}
            <div className="flex items-center gap-1.5 text-gray-500 mb-2">
              <span className="text-xs font-medium">{metric.title}</span>
              <Info className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500 cursor-pointer transition-colors" />
            </div>

            {/* Value */}
            <div className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
              {metric.value}
            </div>

            {/* Subtitle / Change */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-400">vs last month</span>
              <span className="text-[#10b981] font-semibold flex items-center gap-0.5">
                {metric.changeText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
