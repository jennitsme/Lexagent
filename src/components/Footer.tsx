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
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black">
            Ready to start making private transactions?
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Join thousands of users who trust Lexagent for their secure and anonymous crypto transfers.
          </p>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-black text-white font-bold rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.2)] transition-shadow flex items-center gap-2 mx-auto"
        >
          Start Private Transfer
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        <div className="pt-24 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-400 font-mono">
            Powered by LEXAGENT
          </div>
          
          <a href="https://x.com/agentlexagent?s=21" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
