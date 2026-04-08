import { motion } from "motion/react";
import { ArrowRight, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer id="community" className="py-24 px-6 bg-white border-t border-black/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Stop clicking “send.” Start deploying agents.
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            Whether you’re sending funds manually or deploying autonomous agents, Lexagent handles it all.
          </p>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 lex-accent-bg text-white font-bold rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.18)] hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-shadow flex items-center gap-2 mx-auto"
        >
          Launch Lexagent
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        <div className="pt-24 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-500 font-mono">
            Built for the next generation of autonomous economies.
          </div>
          
          <a href="https://x.com/agentlexagent?s=21" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
