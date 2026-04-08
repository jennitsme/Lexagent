import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";

const CONTRACT_ADDRESS = "FKWwPSYGpfBLxYoTW25HMmVHRrjvcybUxGTZweTopump";

const cryptoAssets = ["AUTONOMOUS", "ON-CHAIN", "SOLANA", "TRUSTLESS", "AGENTS", "RULES", "PAYMENTS"];

function HiTechBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_70%)]" />

      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute inset-0 animate-grid-scroll" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          height: 'calc(100% + 80px)',
        }} />
      </div>

      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="black" stopOpacity="0.15" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>
        </defs>

        {[
          { x1: "10%", y1: "20%", x2: "30%", y2: "40%" },
          { x1: "70%", y1: "15%", x2: "90%", y2: "35%" },
          { x1: "20%", y1: "60%", x2: "40%", y2: "80%" },
          { x1: "60%", y1: "70%", x2: "85%", y2: "55%" },
          { x1: "30%", y1: "40%", x2: "70%", y2: "15%" },
          { x1: "40%", y1: "80%", x2: "60%", y2: "70%" },
          { x1: "5%", y1: "50%", x2: "20%", y2: "60%" },
          { x1: "85%", y1: "55%", x2: "95%", y2: "30%" },
        ].map((line, i) => (
          <line key={i} {...line} stroke="black" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="6 4" style={{ animation: `dash-flow ${1.5 + i * 0.2}s linear infinite` }} />
        ))}

        {[
          { cx: "10%", cy: "20%" }, { cx: "30%", cy: "40%" },
          { cx: "70%", cy: "15%" }, { cx: "90%", cy: "35%" },
          { cx: "20%", cy: "60%" }, { cx: "40%", cy: "80%" },
          { cx: "60%", cy: "70%" }, { cx: "85%", cy: "55%" },
          { cx: "50%", cy: "50%" }, { cx: "5%", cy: "50%" },
          { cx: "95%", cy: "30%" },
        ].map((node, i) => (
          <g key={i}>
            <circle {...node} r="12" fill="url(#nodeGlow)" />
            <circle {...node} r="2" fill="black" fillOpacity="0.15">
              <animate attributeName="r" values="2;4;2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.15;0.4;0.15" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
        <div className="absolute inset-0 rounded-full border border-black/[0.04] animate-pulse-ring" />
        <div className="absolute inset-8 rounded-full border border-dashed border-black/[0.05] animate-hex-rotate" />
        <div className="absolute inset-16 rounded-full border border-black/[0.03]" style={{ animation: 'hex-rotate 25s linear infinite reverse' }} />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-orbit">
          <div className="w-1.5 h-1.5 bg-black/20 rounded-full" />
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-orbit-reverse">
          <div className="w-1 h-1 bg-black/15 rounded-full" />
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-full opacity-[0.03]">
        <div className="absolute inset-0 animate-scan-line" style={{
          background: 'linear-gradient(to bottom, transparent 0%, black 50%, transparent 100%)',
          height: '2px',
        }} />
      </div>

      {[
        { left: '15%', top: '25%', delay: '0s' },
        { left: '80%', top: '30%', delay: '1.5s' },
        { left: '25%', top: '70%', delay: '3s' },
        { left: '75%', top: '75%', delay: '4.5s' },
        { left: '50%', top: '15%', delay: '2s' },
        { left: '45%', top: '85%', delay: '5s' },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-black/10 rounded-full"
          style={{
            left: p.left,
            top: p.top,
            animation: `float-particle 6s ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const [copied, setCopied] = useState(false);

  const copyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-white">
      <HiTechBackground />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 mb-8"
      >
        <div className="w-32 h-32 md:w-40 md:h-40 border-2 border-black/10 rounded-2xl flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-black/5 blur-xl group-hover:bg-black/10 transition-all duration-500" />
          <img src="/logo.jpg" alt="LEXAGENT" className="w-28 h-28 md:w-36 md:h-36 rounded-xl relative z-10 object-cover" />
          
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-black" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-black" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-black" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-black" />

          <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" viewBox="0 0 200 200">
            <rect x="5" y="5" width="190" height="190" rx="20" fill="none" stroke="black" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="8 4" className="animate-dash-flow" />
          </svg>
        </div>
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-6xl md:text-8xl font-black tracking-tighter text-center mb-6 relative z-10 text-black"
      >
        LEX<span className="text-gray-400 inline-block animate-pulse">A</span>GENT
      </motion.h1>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="flex flex-wrap justify-center gap-3 mb-12 max-w-2xl px-4"
      >
        {cryptoAssets.map((asset, i) => (
          <motion.span 
            key={asset}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
            whileHover={{ scale: 1.1, y: -2 }}
            className="px-4 py-1.5 rounded-full border border-black/10 bg-black/5 text-xs font-mono text-gray-600 hover:border-black/30 hover:text-black hover:bg-black/10 transition-colors cursor-default"
          >
            {asset}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.8 }}
        className="mb-8 relative z-10 w-full max-w-sm px-4"
      >
        <button
          onClick={copyCA}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-black/10 bg-gray-50 hover:bg-gray-100 hover:border-black/20 transition-all group"
        >
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Contract Address</span>
            <span className="font-mono text-xs text-gray-700 truncate w-full text-left">{CONTRACT_ADDRESS}</span>
          </div>
          <div className="shrink-0 p-1.5 rounded-lg bg-black/5 group-hover:bg-black/10 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          </div>
        </button>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        <Link to="/dashboard">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="group relative px-8 py-4 bg-black text-white font-bold text-lg tracking-wider rounded-lg overflow-hidden transition-shadow hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
            <span className="relative z-10 flex items-center gap-2">
              ENTER LEXAGENT
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </Link>

        <div className="text-center space-y-2 max-w-2xl px-4">
          <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">
            The way we send money is still manual. Click. Confirm. Repeat.
          </p>
          <p className="text-gray-400 text-xs font-mono">
            But the future isn’t manual. It’s autonomous. Lexagent bridges the gap between AI agents and on-chain value movement.
          </p>
        </div>

        <div className="mt-8 px-4 py-2 rounded-full border border-black/10 bg-gray-50 text-gray-600 text-[10px] font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
          BUILT FOR THE NEXT GENERATION OF AUTONOMOUS ECONOMIES
        </div>
      </motion.div>
    </section>
  );
}
