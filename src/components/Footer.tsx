import { motion } from "motion/react";
import { ArrowRight, Twitter, Github, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer id="community" className="py-24 px-6 bg-black border-t border-white/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Ready to start making private transactions?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Join thousands of users who trust LumiChan for their secure and anonymous crypto transfers.
          </p>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] transition-shadow flex items-center gap-2 mx-auto"
        >
          Start Private Transfer
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        <div className="pt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-500 font-mono">
            Powered by LUMICHAN
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>

          <a href="#" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
            Join Community
          </a>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-900/20 blur-[100px] pointer-events-none" />
    </footer>
  );
}
