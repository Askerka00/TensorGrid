import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, XCircle, Clock, Trash2, AlertTriangle } from 'lucide-react';
import type { PayoutResult } from '../types';

interface TransactionsTableProps {
  transactions: PayoutResult[];
  onClearHistory?: () => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onClearHistory,
}) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [isClearing, setIsClearing] = useState(false);

  const confirmedCount = transactions.filter((t) => t.success).length;
  const failedCount = transactions.filter((t) => !t.success).length;

  const filteredList = transactions.filter((t) => {
    if (filter === 'success') return t.success;
    if (filter === 'failed') return !t.success;
    return true;
  });

  const handleClear = async () => {
    if (!onClearHistory) return;
    setIsClearing(true);
    await onClearHistory();
    setIsClearing(false);
  };

  return (
    <div className="px-6 py-2 pb-8">
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs relative flex flex-col overflow-hidden">
        {/* Header with Title and Clear Logs button */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-900">
              Solana Devnet Payout History (On-chain Transactions)
            </h3>
            <span className="text-xs text-gray-400 font-mono ml-1">
              ({transactions.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-gray-50 border border-gray-200/80 rounded-xl p-0.5 text-xs font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setFilter('success')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filter === 'success'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-emerald-700'
                }`}
              >
                Confirmed ({confirmedCount})
              </button>
              {failedCount > 0 && (
                <button
                  onClick={() => setFilter('failed')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filter === 'failed'
                      ? 'bg-white text-red-700 shadow-2xs font-bold'
                      : 'text-gray-500 hover:text-red-700'
                  }`}
                >
                  Failed ({failedCount})
                </button>
              )}
            </div>

            {/* Clear Logs Button */}
            {transactions.length > 0 && onClearHistory && (
              <button
                onClick={handleClear}
                disabled={isClearing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-xs font-semibold transition-all shadow-2xs"
                title="Clear all payout history and error logs"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>{isClearing ? 'Clearing...' : 'Clear History'}</span>
              </button>
            )}
          </div>
        </div>

        {failedCount > 0 && filter === 'all' && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Some transactions failed due to Devnet rate limits. Fallback RPCs and auto-retries (3x) are active.
              </span>
            </div>
            {onClearHistory && (
              <button
                onClick={handleClear}
                className="underline hover:text-amber-950 font-semibold flex-shrink-0 ml-2"
              >
                Dismiss Errors
              </button>
            )}
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-gray-400" />
            <span className="font-semibold text-gray-700">Payout history is empty</span>
            <span className="text-gray-400">
              New micro-payout transactions will stream automatically every 30 seconds while in COMPUTING state
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-white">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Amount (SOL)</th>
                  <th className="py-3 px-4 font-semibold">Recipient</th>
                  <th className="py-3 px-4 font-semibold">
                    TX Signature / Error (Click for Solana Explorer)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredList.map((tx, idx) => {
                  const recipientShort = tx.recipient
                    ? `${tx.recipient.slice(0, 8)}...${tx.recipient.slice(-6)}`
                    : 'N/A';
                  const sigShort = tx.signature
                    ? `${tx.signature.slice(0, 24)}...`
                    : tx.error || 'N/A';

                  return (
                    <tr
                      key={tx.signature || `${idx}-${tx.timestamp || Date.now()}`}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        !tx.success ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        {tx.success ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Confirmed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/60">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-600 font-mono">
                        {tx.amountSol || 0.001} SOL
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        <code>{recipientShort}</code>
                      </td>
                      <td className="py-3.5 px-4">
                        {tx.explorerUrl ? (
                          <a
                            href={tx.explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 font-mono text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <span>{sigShort}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-red-600/90 font-mono text-[11px]">
                            {sigShort}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
