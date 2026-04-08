import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { Zap, Lock, Fingerprint, Network, Scan, Bot, Cpu } from "lucide-react";

const features = [
  {
    id: "01",
    title: "INSTANT TRANSFERS",
    description: "Send crypto seamlessly in seconds across a fast, low-cost, and trustless Solana environment.",
    icon: Zap,
    accentIcon: Network,
    status: "ACTIVE",
    specs: [
      { label: "SPEED", value: "SECONDS" },
      { label: "NETWORK", value: "SOLANA" },
      { label: "COST", value: "LOW" },
    ],
    visualData: [85, 92, 78, 95, 88, 70, 96, 82, 90, 75, 93, 87],
  },
  {
    id: "02",
    title: "PROGRAMMABLE PAYMENTS",
    description: "Define payment rules, automate execution, and run conditional transfers without manual click-confirm-repeat loops.",
    icon: Cpu,
    accentIcon: Fingerprint,
    status: "OPTIMAL",
    specs: [
      { label: "RULES", value: "CUSTOM" },
      { label: "EXECUTION", value: "AUTO" },
      { label: "MODE", value: "CONDITIONAL" },
    ],
    visualData: [40, 65, 50, 90, 45, 80, 55, 95, 60, 85, 70, 92],
  },
  {
    id: "03",
    title: "AGENT PAYMENTS",
    description: "Enable smart escrow, agent-to-agent transactions, and bot-native payment flows for autonomous financial interactions.",
    icon: Bot,
    accentIcon: Lock,
    status: "VERIFIED",
    specs: [
      { label: "ESCROW", value: "TRUSTLESS" },
      { label: "A2A", value: "ENABLED" },
      { label: "BOTS", value: "TG / DISCORD" },
    ],
    visualData: [95, 97, 94, 98, 96, 93, 99, 95, 97, 94, 98, 96],
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number; key?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 200, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, x: isEven ? -30 : 30 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-stretch gap-8 lg:gap-12`}
    >
      <motion.div
        initial={{ opacity: 0, x: isEven ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex-1 flex flex-col justify-center py-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-1 border border-sky-200/50 bg-gray-50 font-mono text-[10px] tracking-widest text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            FEATURE {feature.id}
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-black/10 to-transparent" />
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] text-slate-900 mb-6">
          {feature.title.split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="block"
            >
              {word}
            </motion.span>
          ))}
        </h2>

        <p className="text-slate-600 text-base leading-relaxed max-w-lg mb-8">
          {feature.description}
        </p>

        <div className="flex flex-wrap gap-3">
          {feature.specs.map((spec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="group/spec relative px-4 py-3 border border-black/[0.08] bg-white hover:border-black/20 transition-all duration-300 cursor-default"
            >
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-black/20 group-hover/spec:border-black/40 transition-colors" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-black/20 group-hover/spec:border-black/40 transition-colors" />
              <span className="font-mono text-[9px] tracking-widest text-slate-500 block">{spec.label}</span>
              <span className="font-mono text-sm font-bold text-slate-900">{spec.value}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex-1 flex justify-center items-center">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          className="relative w-full max-w-md aspect-[4/3] group cursor-default"
        >
          <div className="absolute inset-0 border border-black/[0.08] bg-white overflow-hidden transition-all duration-500 group-hover:border-black/20 group-hover:shadow-[0_12px_50px_rgba(0,0,0,0.08)]">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black/15 group-hover:border-black/40 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black/15 group-hover:border-black/40 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black/15 group-hover:border-black/40 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black/15 group-hover:border-black/40 group-hover:w-6 group-hover:h-6 transition-all duration-300" />

            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black/0 to-transparent group-hover:via-black/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black/0 to-transparent group-hover:via-black/10 transition-all duration-700" />

            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />

            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${feature.status === 'ACTIVE' ? 'bg-green-500' : feature.status === 'OPTIMAL' ? 'bg-black' : 'bg-black'} animate-pulse`} />
                    <span className="font-mono text-[9px] tracking-widest text-slate-500">{feature.status}</span>
                  </div>
                  <span className="font-mono text-[10px] tracking-widest text-slate-500">MODULE_{feature.id}</span>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 50 50" className="absolute inset-0 w-full h-full">
                    <polygon points="25,2 46,14.5 46,35.5 25,48 4,35.5 4,14.5" fill="none" stroke="black" strokeOpacity="0.08" strokeWidth="1" className="group-hover:stroke-[black] group-hover:[stroke-opacity:0.2] transition-all duration-500" />
                  </svg>
                  <feature.icon className="w-5 h-5 text-slate-500 group-hover:text-slate-900 transition-colors duration-500" strokeWidth={1.5} />
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center py-4">
                <svg viewBox="0 0 240 80" className="w-full h-full max-h-20" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`grad-${feature.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="black" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="black" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M0,${80 - feature.visualData[0] * 0.7} ${feature.visualData.map((v, i) => `L${(i / (feature.visualData.length - 1)) * 240},${80 - v * 0.7}`).join(' ')} L240,80 L0,80 Z`}
                    fill={`url(#grad-${feature.id})`}
                    className="group-hover:[fill-opacity:1] transition-all duration-700"
                  />
                  <polyline
                    points={feature.visualData.map((v, i) => `${(i / (feature.visualData.length - 1)) * 240},${80 - v * 0.7}`).join(' ')}
                    fill="none"
                    stroke="black"
                    strokeOpacity="0.12"
                    strokeWidth="1.5"
                    className="group-hover:[stroke-opacity:0.3] transition-all duration-500"
                    strokeLinejoin="round"
                  />
                  {feature.visualData.map((v, i) => (
                    <circle
                      key={i}
                      cx={(i / (feature.visualData.length - 1)) * 240}
                      cy={80 - v * 0.7}
                      r="0"
                      fill="black"
                      className="group-hover:[r:2] transition-all duration-500"
                      style={{ transitionDelay: `${i * 30}ms` }}
                    />
                  ))}
                </svg>
              </div>

              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-5xl font-black text-slate-900/[0.06] group-hover:text-slate-900/[0.12] transition-colors duration-500 leading-none block">
                    {feature.id}
                  </span>
                  <span className="font-mono text-[9px] tracking-widest text-slate-500 block uppercase">
                    {feature.title}
                  </span>
                </div>
                <div className="relative">
                  <feature.accentIcon className="w-8 h-8 text-slate-900/[0.06] group-hover:text-slate-900/[0.15] transition-colors duration-500" strokeWidth={1} />
                </div>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.005) 50%, transparent 100%)',
                  height: '3px',
                  animation: 'scan-line 3s linear infinite',
                }} />
              </div>
            </div>
          </div>

          <div className="absolute -inset-3 border border-black/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <svg className="absolute -inset-6 w-[calc(100%+48px)] h-[calc(100%+48px)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="8" y2="0" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
            <line x1="92" y1="0" x2="100" y2="0" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
            <line x1="100" y1="0" x2="100" y2="8" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
            <line x1="0" y1="100" x2="8" y2="100" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
            <line x1="0" y1="92" x2="0" y2="100" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
            <line x1="92" y1="100" x2="100" y2="100" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
            <line x1="100" y1="92" x2="100" y2="100" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="about" className="py-32 px-6 relative overflow-hidden bg-white">
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle, black 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-200/50 bg-gray-50 mb-8 font-mono text-[10px] tracking-widest text-slate-600 uppercase"
          >
            <Scan className="w-3 h-3" />
            Core Modules
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900">
            FEATURES
          </h2>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-black/20" />
            <svg width="8" height="8" viewBox="0 0 8 8">
              <rect x="1" y="1" width="6" height="6" fill="none" stroke="black" strokeOpacity="0.3" strokeWidth="1" transform="rotate(45 4 4)" />
            </svg>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-black/20" />
          </div>
        </motion.div>

        <div className="space-y-20 lg:space-y-28">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
