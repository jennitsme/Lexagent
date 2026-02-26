import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownLeft, Loader2, Wallet } from "lucide-react";
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
  const { address, isConnected } = useWallet();
  const [solBalance, setSolBalance] = useState<number>(0);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    setLoading(true);

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
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Wallet className="w-16 h-16 text-gray-500" />
        <h2 className="text-2xl font-bold text-gray-300">Wallet Not Connected</h2>
        <p className="text-gray-500">Connect your Phantom wallet to view your dashboard.</p>
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
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors duration-500" />

          <div className="relative z-10">
            <div className="text-gray-400 mb-2">Total Balance</div>
            <div className="text-5xl font-black tracking-tight mb-6">
              {loading ? (
                <Loader2 className="w-10 h-10 animate-spin text-blue-400 inline-block" />
              ) : (
                <>
                  ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </>
              )}
            </div>

            <div className="flex gap-4">
              <Link
                to="/dashboard/transfer"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                <ArrowUpRight className="w-5 h-5" />
                Send
              </Link>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center gap-2 transition-all">
                <ArrowDownLeft className="w-5 h-5" />
                Receive
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,100 C150,80 300,120 450,60 C600,0 750,40 900,20 L900,128 L0,128 Z" fill="rgba(37, 99, 235, 0.1)" />
              <path d="M0,100 C150,80 300,120 450,60 C600,0 750,40 900,20" fill="none" stroke="#3B82F6" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="space-y-6">
          {[
            {
              label: "SOL Balance",
              value: loading ? "..." : `${solBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`,
              change: loading ? "..." : `$${solPrice.toFixed(2)}`,
              color: "text-blue-400",
            },
            {
              label: "Network Status",
              value: "Solana Mainnet",
              change: "Active",
              color: "text-green-400",
            },
            {
              label: "SOL Price",
              value: loading ? "..." : `$${solPrice.toFixed(2)}`,
              change: "USD",
              color: "text-purple-400",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors"
            >
              <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
              <div className="flex justify-between items-end">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className={`text-sm font-mono ${stat.color}`}>{stat.change}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No recent transactions found.</div>
          ) : (
            transactions.map((tx, i) => (
              <div
                key={tx.signature}
                className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "sent"
                        ? "bg-red-500/20 text-red-400"
                        : tx.type === "received"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
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
                    <div className="text-xs text-gray-500">{truncateSig(tx.signature)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono">
                    {tx.amount !== null
                      ? `${tx.type === "sent" ? "-" : "+"}${tx.amount.toFixed(4)} SOL`
                      : "—"}
                  </div>
                  <div className="text-xs text-gray-500">{timeAgo(tx.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
