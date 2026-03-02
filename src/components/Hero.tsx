import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const cryptoAssets = ["SOL", "BTC", "ETH", "BNB", "XRP", "USDT", "USDC"];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-100 via-white to-white pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 mb-8"
      >
        <div className="w-32 h-32 md:w-40 md:h-40 border-2 border-black/10 rounded-2xl flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-black/5 blur-xl group-hover:bg-black/10 transition-all duration-500" />
          <img src="/logo.jpg" alt="SENDRA" className="w-28 h-28 md:w-36 md:h-36 rounded-xl relative z-10 object-cover" />
          
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-black" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-black" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-black" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-black" />
        </div>
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-6xl md:text-8xl font-black tracking-tighter text-center mb-6 relative z-10 text-black"
      >
        SEN<span className="text-gray-400 inline-block animate-pulse">D</span>RA
      </motion.h1>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="flex flex-wrap justify-center gap-3 mb-12 max-w-2xl px-4"
      >
        {cryptoAssets.map((asset, i) => (
          <span 
            key={asset}
            className="px-4 py-1.5 rounded-full border border-black/10 bg-black/5 text-xs font-mono text-gray-600 hover:border-black/30 hover:text-black hover:bg-black/10 transition-all cursor-default"
          >
            {asset}
          </span>
        ))}
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        <Link to="/dashboard">
          <button className="group relative px-8 py-4 bg-black text-white font-bold text-lg tracking-wider rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]" />
            <span className="relative z-10 flex items-center gap-2">
              ENTER SENDRA
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </Link>

        <div className="text-center space-y-2">
          <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">
            Next-Gen Encrypted Pathway Register
          </p>
          <p className="text-gray-400 text-xs font-mono">
            CERTIFIED GHOST TX CHANNEL • UNTRACEABLE LEDGER MIGRATION
          </p>
        </div>

        <div className="mt-8 px-4 py-2 rounded-full border border-black/10 bg-gray-50 text-gray-600 text-[10px] font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
          COMPLIANT WITH VOID STANDARD
        </div>
      </motion.div>
    </section>
  );
}
