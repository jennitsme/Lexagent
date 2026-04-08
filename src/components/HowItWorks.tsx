import { motion } from "motion/react";
import { FileText, Cpu, Route, ShieldCheck } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "ENTER DETAILS",
    subtitle: "Initialize Transfer",
    description: "Navigate to the Transfer tab, enter the recipient's wallet address and the amount you want to send privately through our encrypted pathway.",
    icon: FileText,
    status: "INPUT_READY",
    metrics: [
      { label: "PROTOCOL", value: "AES-256" },
      { label: "LATENCY", value: "<100ms" },
    ],
  },
  {
    id: "02",
    title: "CREATE TX",
    subtitle: "Generate Private Pool",
    description: "A temporary private pool is generated with a unique claim code. Review the fee estimate and transaction details before signing.",
    icon: Cpu,
    status: "PROCESSING",
    metrics: [
      { label: "KEYPAIR", value: "ED25519" },
      { label: "ENTROPY", value: "256-BIT" },
    ],
  },
  {
    id: "03",
    title: "ROUTE TX",
    subtitle: "Private Pathway Routing",
    description: "Your SOL is routed to the private pool via Solana's high-speed network. The claim code is the only link to the funds.",
    icon: Route,
    status: "ROUTING",
    metrics: [
      { label: "NETWORK", value: "SOLANA" },
      { label: "CONFIRM", value: "~400ms" },
    ],
  },
  {
    id: "04",
    title: "CONFIRMED",
    subtitle: "Delivery Complete",
    description: "The recipient claims funds using the code. No traceable connection exists between sender and receiver on the blockchain.",
    icon: ShieldCheck,
    status: "COMPLETE",
    metrics: [
      { label: "PRIVACY", value: "100%" },
      { label: "TRACE", value: "NULL" },
    ],
  },
];

function HexagonIcon({ Icon, index }: { Icon: typeof FileText; index: number }) {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full">
        <polygon
          points="40,4 72,22 72,58 40,76 8,58 8,22"
          fill="none"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="1.5"
        />
        <polygon
          points="40,12 64,26 64,54 40,68 16,54 16,26"
          fill="black"
          fillOpacity="0.03"
          stroke="none"
        />
      </svg>
      <Icon className="w-6 h-6 text-slate-900 relative z-10" strokeWidth={1.5} />
    </div>
  );
}

function StepConnector({ isLast }: { isLast: boolean }) {
  if (isLast) return null;
  return (
    <div className="hidden md:flex flex-col items-center py-2">
      <div className="w-[1px] h-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent" />
        <div
          className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-black/30 to-transparent"
          style={{ animation: 'scan-line 2s linear infinite' }}
        />
      </div>
      <svg width="12" height="12" viewBox="0 0 12 12" className="text-slate-900/20 mt-1">
        <polygon points="6,12 0,4 12,4" fill="currentColor" />
      </svg>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="transfer" className="py-32 px-6 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-200/50 bg-gray-50 mb-8 font-mono text-[10px] tracking-widest text-slate-600 uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Protocol Workflow
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-4">
            HOW IT WORKS
          </h2>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-black/20" />
            <svg width="8" height="8" viewBox="0 0 8 8">
              <rect x="1" y="1" width="6" height="6" fill="none" stroke="black" strokeOpacity="0.3" strokeWidth="1" transform="rotate(45 4 4)" />
            </svg>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-black/20" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="relative bg-white border border-sky-200/60 p-6 h-full flex flex-col overflow-hidden transition-shadow duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:border-sky-300/70"
              >
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-sky-300/70 transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-sky-400/70" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-sky-300/70 transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-sky-400/70" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-sky-300/70 transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-sky-400/70" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-sky-300/70 transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-sky-400/70" />

                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black/0 to-transparent group-hover:via-black/20 transition-all duration-500" />

                <div className="absolute inset-0 bg-gradient-to-br from-black/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-start justify-between mb-5 relative z-10">
                  <HexagonIcon Icon={step.icon} index={index} />
                  <div className="text-right">
                    <span className="font-mono text-[10px] tracking-widest text-slate-500 block">STEP</span>
                    <span className="font-mono text-2xl font-black text-slate-900/10 group-hover:text-slate-900/20 transition-colors">{step.id}</span>
                  </div>
                </div>

                <div className="relative z-10 flex-1">
                  <h3 className="text-xl font-black tracking-tight text-slate-900 mb-1 group-hover:tracking-normal transition-all duration-300">
                    {step.title}
                  </h3>
                  <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3">
                    {step.subtitle}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">
                    {step.description}
                  </p>
                </div>

                <div className="relative z-10 mt-auto">
                  <div className="h-[1px] bg-gradient-to-r from-black/10 to-transparent mb-4" />

                  <div className="flex items-center justify-between">
                    {step.metrics.map((metric, mi) => (
                      <div key={mi} className="text-left">
                        <span className="font-mono text-[9px] tracking-widest text-slate-500 block">{metric.label}</span>
                        <span className="font-mono text-xs font-bold text-slate-900/70 group-hover:text-slate-900 transition-colors">{metric.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <span className={`w-1.5 h-1.5 rounded-full ${step.status === 'COMPLETE' ? 'bg-cyan-500' : 'bg-sky-300/70'} ${step.status !== 'COMPLETE' ? 'animate-pulse' : ''}`} />
                    <span className="font-mono text-[9px] tracking-widest text-slate-500">{step.status}</span>
                  </div>
                </div>

                <svg className="absolute bottom-0 right-0 w-24 h-24 text-slate-900/[0.02] group-hover:text-slate-900/[0.05] transition-colors duration-500" viewBox="0 0 100 100">
                  <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="1" />
                  <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
              </motion.div>

              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 items-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-slate-900/20">
                    <path d="M4 8 L12 8 M9 5 L12 8 L9 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex justify-center"
        >
          <div className="inline-flex items-center gap-6 px-8 py-4 border border-sky-200/50 bg-gray-50/50">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-sky-200/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-sky-200/50" />
            {[
              { label: "TOTAL STEPS", value: "04" },
              { label: "AVG TIME", value: "<2 MIN" },
              { label: "SUCCESS RATE", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i} className="text-center px-4">
                <span className="font-mono text-[9px] tracking-widest text-slate-500 block">{stat.label}</span>
                <span className="font-mono text-sm font-bold text-slate-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
