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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-4"
          >
            <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Connect Wallet</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => connect('phantom')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-black/10 hover:bg-gray-50 hover:border-black/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <PhantomLogo className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-black">Phantom</div>
                      <div className="text-xs text-gray-400">Solana Wallet</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>

                <button
                  onClick={() => connect('metamask')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-black/10 hover:bg-gray-50 hover:border-black/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <MetaMaskLogo className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-black">MetaMask</div>
                      <div className="text-xs text-gray-400">Ethereum Wallet</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-black/5 text-center">
                <p className="text-xs text-gray-400">
                  By connecting, you agree to Lexagent's <a href="#" className="text-black hover:underline">Terms of Service</a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
