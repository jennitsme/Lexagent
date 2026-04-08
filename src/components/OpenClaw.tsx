import { motion } from "motion/react";
import { Terminal, Cpu, Network, Bot } from "lucide-react";

export function OpenClaw() {
  return (
    <section id="agents" className="py-32 px-6 relative overflow-hidden bg-sky-50/70">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 text-slate-600 font-mono text-sm tracking-widest uppercase">
              <Terminal className="w-4 h-4" />
              <span>What is Lexagent</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-slate-700">
              PROGRAMMABLE<br />
              PAYMENT LAYER<br />
              <span className="text-slate-500">FOR AGENTS</span>
            </h2>

            <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
              Lexagent is a programmable payment layer on Solana. Agents can think—Lexagent lets them transact, from simple transfers to complex automated workflows.
            </p>

            <div className="flex gap-4">
              {[
                { icon: Bot, label: "Agent-to-Agent" },
                { icon: Cpu, label: "Conditional Rules" },
                { icon: Network, label: "Trustless Escrow" },
              ].map((item) => (
                <div 
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-2 border border-sky-200/65 bg-white text-sm font-mono text-gray-600"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="border border-sky-200/65 bg-white p-6 font-mono text-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-sky-200/65">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-4 text-slate-500 text-xs">agent_factory.sol</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">{'>'}</span>
                  <span className="text-slate-600"> Loading payment rules...</span>
                </div>
                <div>
                  <span className="text-slate-500">{'>'}</span>
                  <span className="text-green-600"> Conditional transfer executed</span>
                </div>
                <div>
                  <span className="text-slate-500">{'>'}</span>
                  <span className="text-slate-600"> Status: </span>
                  <span className="text-green-600">AUTONOMOUS</span>
                </div>
                <div className="pt-4 border-t border-sky-200/40 mt-4 space-y-1 text-slate-500">
                  <div className="flex justify-between">
                    <span>FLOW_ID</span>
                    <span className="text-slate-700">0x7F3a...9C2d</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SETTLEMENT</span>
                    <span className="text-slate-700">00:00:01</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">NETWORK</span>
                    <span className="text-slate-700">Solana</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -inset-4 border border-sky-200/40 -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
