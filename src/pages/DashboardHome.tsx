import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ArrowDownLeft, Loader2, Wallet, Copy, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getSolBalance, getSOLPrice, getRecentTransactions, TransactionInfo } from "../lib/solana";

function timeAgo(timestamp: number | null): string {
  if (!timestamp) return "Unknown";
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function truncateSig(sig: string): string {
  return `${sig.slice(0, 6)}...${sig.slice(-6)}`;
}

export default function DashboardHome() {
  const { address, isConnected, openModal, walletType } = useWallet();
  const [solBalance, setSolBalance] = useState<number>(0);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReceive, setShowReceive] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!address || walletType !== "phantom") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      getSolBalance(address),
      getSOLPrice(),
      getRecentTransactions(address, 4),
    ])
      .then(([balance, price, txs]) => {
        setSolBalance(balance);
        setSolPrice(price);
        setTransactions(txs);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please check your connection and try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected || walletType !== "phantom") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Wallet className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-700">
          {walletType === "metamask" ? "Unsupported Wallet" : "Wallet Not Connected"}
        </h2>
        <p className="text-gray-400">
          {walletType === "metamask"
            ? "MetaMask is not supported. Please connect a Phantom wallet for Solana."
            : "Connect your Phantom wallet to view your dashboard."}
        </p>
        <button
          onClick={openModal}
          className="mt-4 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-bold transition-all"
        >
          Connect Phantom Wallet
        </button>
      </div>
    );
  }

  const totalUsd = solBalance * solPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <AnimatePresence>
        {showReceive && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceive(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-6"
            >
              <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Receive SOL</h3>
                  <button onClick={() => setShowReceive(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Share your wallet address to receive SOL or SPL tokens on Solana.
                </p>

                <div className="p-4 bg-gray-50 rounded-xl border border-black/5 mb-4">
                  <p className="text-xs text-gray-400 mb-2">Your Solana Address</p>
                  <p className="font-mono text-sm break-all text-black">{address}</p>
                </div>

                <button
                  onClick={copyAddress}
                  className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Address
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors">Retry</button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 sm:p-8 rounded-2xl bg-white border border-black/10 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-gray-400 mb-2 text-sm sm:text-base">Total Balance</div>
            <div className="text-3xl sm:text-5xl font-black tracking-tight mb-4 sm:mb-6 text-black">
              {loading ? (
                <Loader2 className="w-8 sm:w-10 h-8 sm:h-10 animate-spin text-gray-400 inline-block" />
              ) : (
                <>
                  ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </>
              )}
            </div>

            <div className="flex gap-3 sm:gap-4">
              <Link
                to="/dashboard/transfer"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-bold flex items-center gap-2 transition-all text-sm sm:text-base"
              >
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                Send
              </Link>
              <button
                onClick={() => setShowReceive(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-bold flex items-center gap-2 transition-all text-sm sm:text-base"
              >
                <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Receive
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,100 C150,80 300,120 450,60 C600,0 750,40 900,20 L900,128 L0,128 Z" fill="rgba(0, 0, 0, 0.03)" />
              <path d="M0,100 C150,80 300,120 450,60 C600,0 750,40 900,20" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="space-y-6">
          {[
            {
              label: "SOL Balance",
              value: loading ? "..." : `${solBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`,
              change: loading ? "..." : `$${solPrice.toFixed(2)}`,
              color: "text-gray-500",
            },
            {
              label: "Network Status",
              value: "Solana Mainnet",
              change: "Active",
              color: "text-green-500",
            },
            {
              label: "SOL Price",
              value: loading ? "..." : `$${solPrice.toFixed(2)}`,
              change: "USD",
              color: "text-gray-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-white border border-black/10 hover:border-black/20 transition-colors"
            >
              <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
              <div className="flex justify-between items-end">
                <div className="text-xl font-bold text-black">{stat.value}</div>
                <div className={`text-sm font-mono ${stat.color}`}>{stat.change}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-black">Recent Activity</h2>
        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-400">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No recent transactions found.</div>
          ) : (
            transactions.map((tx, i) => (
              <a
                key={tx.signature}
                href={`https://explorer.solana.com/tx/${tx.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border-b border-black/5 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "sent"
                        ? "bg-red-50 text-red-500"
                        : tx.type === "received"
                        ? "bg-green-50 text-green-500"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tx.type === "sent" ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-black">
                      {tx.type === "sent" ? "Sent SOL" : tx.type === "received" ? "Received SOL" : "Transaction"}
                    </div>
                    <div className="text-xs text-gray-400">{truncateSig(tx.signature)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-black">
                    {tx.amount !== null
                      ? `${tx.type === "sent" ? "-" : "+"}${tx.amount.toFixed(4)} SOL`
                      : "—"}
                  </div>
                  <div className="text-xs text-gray-400">{timeAgo(tx.timestamp)}</div>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
