import { motion } from "motion/react";
import { User, Bell, Shield, Wallet, ChevronRight } from "lucide-react";

export default function Settings() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
          AG
        </div>
        <div>
          <h2 className="text-2xl font-bold">Agent 8829</h2>
          <p className="text-gray-400">agent.8829@lumichan.io</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs border border-blue-500/30">
              Verified
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs border border-purple-500/30">
              Premium
            </span>
          </div>
        </div>
        <button className="ml-auto px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
          Edit Profile
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold px-2">Preferences</h3>
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          {[
            { icon: User, label: "Account Information", desc: "Update your personal details" },
            { icon: Bell, label: "Notifications", desc: "Manage your alert preferences" },
            { icon: Shield, label: "Security & Privacy", desc: "2FA, Password, and Privacy settings" },
            { icon: Wallet, label: "Connected Wallets", desc: "Manage your connected accounts" },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-left group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold px-2 text-red-400">Danger Zone</h3>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors text-left">
            <div>
              <div className="font-medium text-red-400">Delete Account</div>
              <div className="text-sm text-red-400/60">Permanently remove your account and all data</div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
