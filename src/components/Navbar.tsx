import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useState } from "react";
import { PhantomLogo } from "./icons/PhantomLogo";
import { MetaMaskLogo } from "./icons/MetaMaskLogo";

export function Navbar() {
  const { isConnected, address, openModal, disconnect, walletType } = useWallet();
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5 bg-black/50"
    >
      <div className="flex items-center gap-2">
        <img src="/logo.jpg" alt="SENDRA" className="w-8 h-8 rounded-sm object-cover" />
        <span className="font-bold text-xl tracking-wider">SENDRA</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        {["About", "Agents", "Transfer", "Community"].map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`}
            className="hover:text-white transition-colors relative group"
          >
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full border border-gray-800 text-xs font-mono text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          $SENDRA
        </div>
        
        {isConnected && address ? (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button 
                onClick={copyAddress}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-blue-500/30 text-white text-sm font-mono rounded-full hover:bg-gray-800 transition-all"
              >
                {walletType === 'phantom' ? (
                  <PhantomLogo className="w-4 h-4" />
                ) : walletType === 'metamask' ? (
                  <MetaMaskLogo className="w-4 h-4" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
                {formatAddress(address)}
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-500" />}
              </button>
            </div>
            <button 
              onClick={disconnect}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
              title="Disconnect"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-95"
          >
            <Wallet className="w-4 h-4" />
            Connect
          </button>
        )}
      </div>
    </motion.nav>
  );
}
