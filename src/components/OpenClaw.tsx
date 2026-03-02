import { motion } from "motion/react";
import { Terminal, Cpu, Network, Bot } from "lucide-react";

export function OpenClaw() {
  return (
    <section id="agents" className="py-32 px-6 relative overflow-hidden bg-black">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a1a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 text-blue-500 font-mono text-sm tracking-widest uppercase">
              <Terminal className="w-4 h-4" />
              <span>System Upgrade Available</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
              OPENCLAW<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                AGENT ENGINE
              </span>
            </h2>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
              Deploy autonomous neural entities on the blockchain. The OpenClaw protocol enables you to construct self-governing agents that execute complex transaction strategies with zero latency.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: Bot, title: "Neural Architecture", desc: "Self-learning transaction patterns" },
                { icon: Network, title: "Swarm Intelligence", desc: "Coordinated multi-agent execution" },
                { icon: Cpu, title: "Edge Processing", desc: "Local computation, global consensus" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex items-center gap-4 p-4 border border-white/5 bg-white/5 rounded-lg hover:border-blue-500/30 transition-colors group"
                >
                  <div className="p-3 bg-blue-500/10 rounded-md text-blue-400 group-hover:text-blue-300 transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Content - Code/Terminal Interface */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30" />
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="text-xs font-mono text-gray-500">openclaw_cli — v2.4.0</div>
              </div>

              {/* Terminal Body */}
              <div className="p-6 font-mono text-sm space-y-4">
                <div className="flex gap-2">
                  <span className="text-blue-500">➜</span>
                  <span className="text-gray-400">~/agents</span>
                  <span className="text-white">openclaw init --neural</span>
                </div>
                
                <div className="space-y-1 text-gray-500">
                  <p>Initializing OpenClaw environment...</p>
                  <p>Loading neural weights [====================] 100%</p>
                  <p>Connecting to mainnet node...</p>
                  <p className="text-green-500">✓ Environment ready</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <span className="text-blue-500">➜</span>
                  <span className="text-gray-400">~/agents</span>
                  <span className="text-white">deploy agent_01.ts</span>
                </div>

                <div className="p-4 bg-blue-900/10 border-l-2 border-blue-500 rounded-r-md mt-2">
                  <p className="text-blue-300">Deploying Autonomous Agent...</p>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">ID</span>
                      <span className="text-white">AG-8829-X</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">STATUS</span>
                      <span className="text-green-400 animate-pulse">ONLINE</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">UPTIME</span>
                      <span className="text-white">00:00:01</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">NETWORK</span>
                      <span className="text-white">Sendra Mainnet</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 animate-pulse">
                  <span className="text-blue-500">➜</span>
                  <span className="text-white">_</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
