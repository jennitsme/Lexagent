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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isConnected || !address || walletType !== "phantom") return;
    setLoading(true);
    setError(null);
    getRecentTransactions(address, 20)
      .then(setTransactions)
      .catch((err) => {
        console.error(err);
        setError("Failed to load transaction history. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [address, isConnected, walletType]);

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
        className="flex flex-col items-center justify-center py-20 text-blue-600 space-y-4"
      >
        <Inbox className="w-12 h-12 text-gray-300" />
        <p className="text-lg font-medium text-center px-4">
          {walletType === "metamask"
            ? "MetaMask is not supported. Please connect a Phantom wallet."
            : "Connect your wallet to view transaction history"}
        </p>
        <button
          onClick={openModal}
          className="px-6 py-3 lex-accent-bg text-white rounded-lg font-bold transition-all"
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
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
        <input
          type="text"
          placeholder="Search by signature..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-sky-200/70 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-sky-400/70 transition-colors text-blue-700"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-blue-600">Loading transactions...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-blue-500">
          <Inbox className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            {searchQuery ? "No transactions match your search" : "No transactions found"}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-sky-200/70 bg-white overflow-hidden hidden md:block">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-sky-200/50 text-sm font-medium text-blue-500">
              <div className="col-span-5">Transaction</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>

            {filtered.map((tx) => (
              <div
                key={tx.signature}
                className="grid grid-cols-12 gap-4 p-4 border-b border-sky-200/50 last:border-0 hover:bg-sky-50/70 transition-colors items-center"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === "sent"
                        ? "bg-rose-50 text-red-500"
                        : tx.type === "received"
                        ? "bg-emerald-50 text-green-500"
                        : "bg-sky-100/70 text-blue-600"
                    }`}
                  >
                    {tx.type === "sent" ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-blue-700">
                      {tx.type === "sent" ? "Sent SOL" : tx.type === "received" ? "Received SOL" : "Transaction"}
                    </div>
                    <a
                      href={`https://explorer.solana.com/tx/${tx.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 font-mono hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      {truncateSignature(tx.signature)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="px-2 py-1 rounded-full bg-emerald-50 text-green-600 text-xs font-medium border border-green-200">
                    {tx.status}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-blue-600">
                  {formatRelativeTime(tx.timestamp)}
                </div>
                <div className="col-span-2 text-right font-mono font-medium text-blue-700">
                  {tx.amount !== null
                    ? `${tx.type === "sent" ? "-" : "+"}${tx.amount.toFixed(4)} SOL`
                    : "—"}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((tx) => (
              <a
                key={tx.signature}
                href={`https://explorer.solana.com/tx/${tx.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl bg-white border border-sky-200/70 hover:bg-sky-50/70 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === "sent"
                          ? "bg-rose-50 text-red-500"
                          : tx.type === "received"
                          ? "bg-emerald-50 text-green-500"
                          : "bg-sky-100/70 text-blue-600"
                      }`}
                    >
                      {tx.type === "sent" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-bold text-sm text-blue-700">
                      {tx.type === "sent" ? "Sent SOL" : tx.type === "received" ? "Received SOL" : "Transaction"}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-medium text-blue-700">
                    {tx.amount !== null
                      ? `${tx.type === "sent" ? "-" : "+"}${tx.amount.toFixed(4)} SOL`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-blue-500">
                  <span className="font-mono flex items-center gap-1">
                    {truncateSignature(tx.signature)}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                  <span>{formatRelativeTime(tx.timestamp)}</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
