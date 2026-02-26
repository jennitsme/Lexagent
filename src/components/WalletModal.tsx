import { motion, AnimatePresence } from "motion/react";
import { X, Wallet, ExternalLink } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { PhantomLogo } from "./icons/PhantomLogo";
import { MetaMaskLogo } from "./icons/MetaMaskLogo";

export function WalletModal() {
  const { isModalOpen, closeModal, connect } = useWallet();

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-6"
          >
            <div className="bg-[#0a0a0a] border border-blue-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.2)] relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/50">
                    <Wallet className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-4 relative z-10">
                <button
                  onClick={() => connect('phantom')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-blue-600/10 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#AB9FF2]/20 rounded-full flex items-center justify-center">
                      <PhantomLogo className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">Phantom</div>
                      <div className="text-xs text-gray-500">Solana Network</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>

                <button
                  onClick={() => connect('metamask')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-orange-600/10 border border-white/10 hover:border-orange-500/50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#F6851B]/20 rounded-full flex items-center justify-center">
                      <MetaMaskLogo className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white group-hover:text-orange-400 transition-colors">MetaMask</div>
                      <div className="text-xs text-gray-500">Ethereum Network</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-gray-500">
                  By connecting, you agree to LumiChan's <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>
                </p>
              </div>

              {/* Background Effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[80px] pointer-events-none" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
