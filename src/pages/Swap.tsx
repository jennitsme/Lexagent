import { motion } from "motion/react";
import { ArrowDown, RefreshCw, Settings2 } from "lucide-react";

export default function Swap() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Swap</h2>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Settings2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-2 relative">
          {/* From Input */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-400">From</span>
              <span className="text-xs text-gray-400">Balance: 12.45</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                placeholder="0.0" 
                className="w-full bg-transparent text-3xl font-bold focus:outline-none"
              />
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-bold">
                <div className="w-5 h-5 rounded-full bg-blue-500" />
                ETH
              </button>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button className="p-2 rounded-xl bg-[#111] border border-white/10 hover:border-blue-500/50 hover:text-blue-400 transition-all">
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          {/* To Input */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-400">To</span>
              <span className="text-xs text-gray-400">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                placeholder="0.0" 
                className="w-full bg-transparent text-3xl font-bold focus:outline-none"
              />
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-bold">
                <div className="w-5 h-5 rounded-full bg-green-500" />
                USDC
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="p-3 rounded-lg bg-white/5 text-xs space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Rate</span>
              <span>1 ETH = 2,845.20 USDC</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Network Fee</span>
              <span>~$4.50</span>
            </div>
          </div>

          <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2">
            Swap Assets
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
