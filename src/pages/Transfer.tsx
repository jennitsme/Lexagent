import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Wallet, Loader2, CheckCircle, XCircle } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "../context/WalletContext";
import { getSolBalance, sendSol } from "../lib/solana";

export default function Transfer() {
  const { address, isConnected, signAndSendTransaction } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!address) return;
    setBalanceLoading(true);
    getSolBalance(address)
      .then(setBalance)
      .catch(() => setBalance(null))
      .finally(() => setBalanceLoading(false));
  }, [address]);

  const handleMax = () => {
    if (balance !== null) {
      const max = Math.max(0, balance - 0.001);
      setAmount(max.toFixed(9).replace(/\.?0+$/, ""));
    }
  };

  const handleSend = async () => {
    if (!address) return;
    setStatus(null);

    try {
      new PublicKey(recipient);
    } catch {
      setStatus({ type: "error", message: "Invalid Solana address" });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatus({ type: "error", message: "Enter a valid amount greater than 0" });
      return;
    }
    if (balance !== null && amountNum > balance) {
      setStatus({ type: "error", message: "Insufficient balance" });
      return;
    }

    setLoading(true);
    try {
      const transaction = await sendSol(address, recipient, amountNum);
      const signature = await signAndSendTransaction(transaction);
      setStatus({ type: "success", message: `Transaction sent! Signature: ${signature.slice(0, 16)}...${signature.slice(-16)}` });
      setAmount("");
      setRecipient("");
      getSolBalance(address).then(setBalance).catch(() => {});
    } catch (err: any) {
      setStatus({ type: "error", message: err?.message || "Transaction failed" });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
          <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect your wallet to send SOL</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Asset</label>
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-blue-500/50 bg-blue-500/10 transition-all">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                <span className="font-bold">SOL</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Recipient Address</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Solana address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pl-12 focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
              />
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Amount</label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-2xl font-bold focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">SOL</div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {balanceLoading
                  ? "Loading balance..."
                  : balance !== null
                  ? `Available: ${balance.toFixed(4)} SOL`
                  : "Unable to load balance"}
              </span>
              <button onClick={handleMax} className="text-blue-400 hover:text-blue-300">
                Max
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Network</span>
              <span className="text-white">Solana Mainnet</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Fee</span>
              <span className="text-white">~0.000005 SOL</span>
            </div>
          </div>

          {status && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                status.type === "success"
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              )}
              <span
                className={`text-sm break-all ${
                  status.type === "success" ? "text-green-300" : "text-red-300"
                }`}
              >
                {status.message}
              </span>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Assets
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
