import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from "lucide-react";

export default function History() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm font-medium text-gray-400">
          <div className="col-span-5">Transaction</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors items-center">
            <div className="col-span-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                {i % 2 === 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold">{i % 2 === 0 ? 'Sent ETH' : 'Received USDC'}</div>
                <div className="text-xs text-gray-500 font-mono">0x82...92a1</div>
              </div>
            </div>
            <div className="col-span-3">
              <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                Completed
              </span>
            </div>
            <div className="col-span-2 text-sm text-gray-400">
              2 mins ago
            </div>
            <div className="col-span-2 text-right font-mono font-medium">
              {i % 2 === 0 ? '-' : '+'}0.42 ETH
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
