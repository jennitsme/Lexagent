import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Wallet,
  Loader2,
  CheckCircle,
  XCircle,
  Send,
  Download,
  Copy,
  Check,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Key,
  ExternalLink,
} from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { getSolBalance, createPrivatePool, claimFromPool } from "../lib/solana";

type Tab = "send" | "claim";

export default function Transfer() {
  const { address, isConnected, signAndSendTransaction, openModal, walletType } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>("send");

  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [poolCopied, setPoolCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const [claimCode, setClaimCode] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!address || walletType !== "phantom") return;
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

  const handlePrivateSend = async () => {
    if (!address) return;
    setStatus(null);
    setGeneratedCode(null);
    setPoolAddress(null);

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
      const { transaction, claimCode: code, poolAddress: pool } = await createPrivatePool(address, amountNum);
      const signature = await signAndSendTransaction(transaction);
      setGeneratedCode(code);
      setPoolAddress(pool);
      setStatus({
        type: "success",
        message: `Private transfer created! TX: ${signature.slice(0, 12)}...${signature.slice(-12)}`,
      });
      setAmount("");
      getSolBalance(address).then(setBalance).catch(() => {});
    } catch (err: any) {
      setStatus({ type: "error", message: err?.message || "Transaction failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!address) return;
    setClaimStatus(null);

    if (!claimCode.trim()) {
      setClaimStatus({ type: "error", message: "Please enter a claim code" });
      return;
    }

    setClaimLoading(true);
    try {
      const signature = await claimFromPool(claimCode.trim(), address);
      setClaimStatus({
        type: "success",
        message: `Claimed successfully! TX: ${signature.slice(0, 12)}...${signature.slice(-12)}`,
      });
      setClaimCode("");
      getSolBalance(address).then(setBalance).catch(() => {});
    } catch (err: any) {
      setClaimStatus({ type: "error", message: err?.message || "Claim failed" });
    } finally {
      setClaimLoading(false);
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setStatus(null);
    setClaimStatus(null);
    setGeneratedCode(null);
    setPoolAddress(null);
    setShowCode(false);
  };

  if (!isConnected || walletType !== "phantom") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
          <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            {walletType === "metamask"
              ? "MetaMask is not supported. Please connect a Phantom wallet for Solana."
              : "Connect your wallet to use Private Transfer"}
          </p>
          <button
            onClick={openModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all"
          >
            Connect Phantom Wallet
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-blue-400" />
        <div>
          <h2 className="text-lg font-bold">Private Transfer</h2>
          <p className="text-xs text-gray-500">Send SOL privately via claim codes</p>
        </div>
      </div>

      <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
        <button
          onClick={() => switchTab("send")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
            activeTab === "send"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Send className="w-4 h-4" />
          Send to Pool
        </button>
        <button
          onClick={() => switchTab("claim")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
            activeTab === "claim"
              ? "bg-green-600 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Download className="w-4 h-4" />
          Claim with Code
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "send" ? (
          <motion.div
            key="send"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-blue-300 mb-1">How it works</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-400 text-xs">
                      <li>Your SOL is sent to a temporary private pool</li>
                      <li>A unique claim code is generated</li>
                      <li>Share the code with the recipient</li>
                      <li>Recipient claims using the code</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Amount to Send</label>
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
                  <span>Transfer Type</span>
                  <span className="text-blue-400 font-medium">Private Pool</span>
                </div>
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

              {generatedCode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-yellow-300">Claim Code Generated</span>
                  </div>

                  <p className="text-xs text-gray-400 mb-3">
                    Share this code with the recipient. They can claim the SOL from the "Claim with Code" tab.
                    Do not lose this code — it cannot be recovered.
                  </p>

                  <div className="relative p-3 bg-black/40 rounded-lg border border-white/10 mb-3">
                    <p className="font-mono text-sm break-all pr-16 text-white">
                      {showCode ? generatedCode : "•".repeat(Math.min(generatedCode.length, 60))}
                    </p>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button
                        onClick={() => setShowCode(!showCode)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title={showCode ? "Hide code" : "Show code"}
                      >
                        {showCode ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={copyCode}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="Copy code"
                      >
                        {codeCopied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {poolAddress && (
                    <div className="mt-3 p-3 bg-black/40 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 font-medium">Pool Address</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(poolAddress);
                              setPoolCopied(true);
                              setTimeout(() => setPoolCopied(false), 2000);
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Copy pool address"
                          >
                            {poolCopied ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                          <a
                            href={`https://explorer.solana.com/address/${poolAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="View on Solana Explorer"
                          >
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        </div>
                      </div>
                      <p className="font-mono text-xs break-all text-blue-300">{poolAddress}</p>
                    </div>
                  )}
                </motion.div>
              )}

              <button
                onClick={handlePrivateSend}
                disabled={loading || !!generatedCode}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Private Pool...
                  </>
                ) : generatedCode ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Code Generated — Copy & Share
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Send to Private Pool
                  </>
                )}
              </button>

              {generatedCode && (
                <button
                  onClick={() => {
                    setGeneratedCode(null);
                    setPoolAddress(null);
                    setStatus(null);
                    setShowCode(false);
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-all text-sm"
                >
                  Create Another Transfer
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="claim"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 blur-[80px] pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-green-300 mb-1">Claim SOL</p>
                    <p className="text-xs text-gray-400">
                      Enter the claim code you received. The SOL will be transferred directly to your connected wallet.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Claim Code</label>
                <div className="relative">
                  <textarea
                    placeholder="Paste your claim code here..."
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value)}
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-green-500/50 transition-colors resize-none"
                  />
                  <Key className="absolute right-4 top-4 w-5 h-5 text-gray-600" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Destination</span>
                  <span className="text-white font-mono text-xs">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Network</span>
                  <span className="text-white">Solana Mainnet</span>
                </div>
              </div>

              {claimStatus && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    claimStatus.type === "success"
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  {claimStatus.type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <span
                    className={`text-sm break-all ${
                      claimStatus.type === "success" ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {claimStatus.message}
                  </span>
                </div>
              )}

              <button
                onClick={handleClaim}
                disabled={claimLoading || !claimCode.trim()}
                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] flex items-center justify-center gap-2"
              >
                {claimLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Claim SOL
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
