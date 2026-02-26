import { motion } from "motion/react";
import { ArrowRight, Wallet, ShieldCheck } from "lucide-react";

export default function Transfer() {
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
            <label className="text-sm text-gray-400 font-medium">Select Asset</label>
            <div className="grid grid-cols-3 gap-4">
              {["ETH", "SOL", "USDC"].map((asset) => (
                <button key={asset} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-black/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group">
                  <div className="w-6 h-6 rounded-full bg-white/10" />
                  <span className="font-bold">{asset}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Recipient Address</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="0x..." 
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
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-2xl font-bold focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">ETH</div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Available: 12.45 ETH</span>
              <button className="text-blue-400 hover:text-blue-300">Max</button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm">
              <div className="font-bold text-blue-400">Privacy Mode Active</div>
              <div className="text-blue-200/60">Your transaction will be routed through the LumiChan null-route pathway, ensuring complete anonymity.</div>
            </div>
          </div>

          <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2">
            Send Assets
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
