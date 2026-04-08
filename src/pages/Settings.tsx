import { useState } from "react";
import { motion } from "motion/react";
import { Wallet, Copy, LogOut, Check, Globe } from "lucide-react";
import { useWallet } from "../context/WalletContext";

export default function Settings() {
  const { address, walletType, isConnected, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center space-y-4">
          <Wallet className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-xl font-bold text-blue-600">No Wallet Connected</h2>
          <p className="text-blue-500">Connect your wallet to view settings.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-white border border-sky-200/70">
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-2xl font-bold shrink-0">
          <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-700">{truncatedAddress}</h2>
          <p className="text-blue-500 text-xs sm:text-sm break-all">{address}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-xs border border-purple-200 capitalize">
              {walletType}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100/70 text-blue-600 text-xs border border-gray-200 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Solana
            </span>
          </div>
        </div>
        <button
          onClick={copyAddress}
          className="w-full sm:w-auto px-4 py-2 rounded-lg border border-sky-200/70 hover:bg-sky-50/70 transition-colors flex items-center justify-center gap-2 text-blue-700"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy Address"}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold px-2 text-blue-700">Connected Wallets</h3>
        <div className="rounded-2xl border border-sky-200/70 bg-white overflow-hidden">
          <div className="w-full flex items-center gap-4 p-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-sky-100/70 flex items-center justify-center text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium capitalize text-blue-700">{walletType} Wallet</div>
              <div className="text-sm text-blue-500">{truncatedAddress}</div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-green-600 text-xs border border-green-200">
              Connected
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold px-2 text-red-500">Actions</h3>
        <div className="rounded-2xl border border-red-200 bg-rose-50 overflow-hidden">
          <button
            onClick={disconnect}
            className="w-full flex items-center justify-between p-4 hover:bg-red-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium text-red-600">Disconnect Wallet</div>
                <div className="text-sm text-red-400">Disconnect your {walletType} wallet</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
