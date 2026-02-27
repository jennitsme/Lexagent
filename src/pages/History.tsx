import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownLeft, Search, ExternalLink, Loader2, Inbox } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { getRecentTransactions, TransactionInfo } from "../lib/solana";

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "Unknown";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
}

function truncateSignature(sig: string): string {
  return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
}

export default function History() {
  const { address, isConnected, walletType, openModal } = useWallet();
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isConnected || !address || walletType !== "phantom") return;
    setLoading(true);
    getRecentTransactions(address, 20)
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address, isConnected]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((tx) => tx.signature.toLowerCase().includes(q));
  }, [transactions, searchQuery]);

  if (!isConnected || walletType !== "phantom") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4"
      >
        <Inbox className="w-12 h-12" />
        <p className="text-lg font-medium">
          {walletType === "metamask"
            ? "MetaMask is not supported. Please connect a Phantom wallet."
            : "Connect your wallet to view transaction history"}
        </p>
        <button
          onClick={openModal}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all"
        >
          Connect Phantom Wallet
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by signature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-3 text-gray-400">Loading transactions...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Inbox className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">
            {searchQuery ? "No transactions match your search" : "No transactions found"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm font-medium text-gray-400">
            <div className="col-span-5">Transaction</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {filtered.map((tx) => (
            <div
              key={tx.signature}
              className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors items-center"
            >
              <div className="col-span-5 flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === "sent"
                      ? "bg-blue-500/20 text-blue-400"
                      : tx.type === "received"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {tx.type === "sent" ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-bold">
                    {tx.type === "sent" ? "Sent SOL" : tx.type === "received" ? "Received SOL" : "Transaction"}
                  </div>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 font-mono hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    {truncateSignature(tx.signature)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="col-span-3">
                <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                  {tx.status}
                </span>
              </div>
              <div className="col-span-2 text-sm text-gray-400">
                {formatRelativeTime(tx.timestamp)}
              </div>
              <div className="col-span-2 text-right font-mono font-medium">
                {tx.amount !== null
                  ? `${tx.type === "sent" ? "-" : "+"}${tx.amount.toFixed(4)} SOL`
                  : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
