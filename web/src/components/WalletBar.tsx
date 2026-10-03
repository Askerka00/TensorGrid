import React, { useState } from 'react';
import { Wallet, Save, Check, Copy, ExternalLink } from 'lucide-react';

interface WalletBarProps {
  currentWallet: string;
  onSaveWallet: (wallet: string) => Promise<boolean>;
}

export const WalletBar: React.FC<WalletBarProps> = ({
  currentWallet,
  onSaveWallet,
}) => {
  const [wallet, setWallet] = useState(currentWallet);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setWallet(currentWallet);
  }, [currentWallet]);

  const handleSave = async () => {
    if (!wallet.trim()) return;
    setIsSaving(true);
    const success = await onSaveWallet(wallet.trim());
    setIsSaving(false);
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-6 py-2">
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </span>
            <span>Link Solana Wallet for Micro-Payouts (Phantom / Solflare)</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://explorer.solana.com/address/${wallet}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Solana Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Enter Solana wallet public address (e.g. from Phantom)..."
              className="w-full bg-[#fbfbfd] border border-gray-200/90 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-gray-800 outline-none focus:border-gray-400 focus:bg-white transition-all shadow-2xs"
            />
            <button
              onClick={handleCopy}
              title="Copy address"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs flex-shrink-0 ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Wallet'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
