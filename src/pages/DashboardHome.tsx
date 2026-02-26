import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardHome() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Portfolio Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors duration-500" />
          
          <div className="relative z-10">
            <div className="text-gray-400 mb-2">Total Balance</div>
            <div className="text-5xl font-black tracking-tight mb-6">
              $124,592.84
              <span className="text-lg font-medium text-green-500 ml-4">+2.4%</span>
            </div>

            <div className="flex gap-4">
              <Link to="/dashboard/transfer" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                <ArrowUpRight className="w-5 h-5" />
                Send
              </Link>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center gap-2 transition-all">
                <ArrowDownLeft className="w-5 h-5" />
                Receive
              </button>
            </div>
          </div>

          {/* Decorative Chart Line */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,100 C150,80 300,120 450,60 C600,0 750,40 900,20 L900,128 L0,128 Z" fill="rgba(37, 99, 235, 0.1)" />
              <path d="M0,100 C150,80 300,120 450,60 C600,0 750,40 900,20" fill="none" stroke="#3B82F6" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {[
            { label: "LUMI Staked", value: "45,000 LUMI", change: "+12%", color: "text-blue-400" },
            { label: "Network Status", value: "Optimal", change: "14ms", color: "text-green-400" },
            { label: "Privacy Score", value: "98/100", change: "High", color: "text-purple-400" },
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

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">Sent ETH</div>
                  <div className="text-xs text-gray-500">To: 0x82...92a1</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono">-0.42 ETH</div>
                <div className="text-xs text-gray-500">2 mins ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
