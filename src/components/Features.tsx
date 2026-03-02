import { motion } from "motion/react";
import { Shield, Zap, Lock } from "lucide-react";

const features = [
  {
    id: "01",
    title: "COMPLETE PRIVACY",
    description: "Your transaction details, amounts, and recipient addresses remain completely private and untraceable. Every transfer is encrypted through our null-route pathway.",
    align: "left",
    icon: Lock,
  },
  {
    id: "02",
    title: "LIGHTNING FAST",
    description: "Leverage Solana's high-speed network for instant private transactions with minimal fees. No waiting, no delays.",
    align: "right",
    icon: Zap,
  },
  {
    id: "03",
    title: "SECURE & TRUSTLESS",
    description: "Non-custodial solution where you maintain full control of your funds through your wallet. No intermediaries, no trust required.",
    align: "center",
    icon: Shield,
  },
];

export function Features() {
  return (
    <section id="about" className="py-24 px-6 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto space-y-32">
        {features.map((feature, index) => (
          <motion.div 
            key={feature.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className={`flex flex-col md:flex-row items-center gap-12 ${
              feature.align === "right" ? "md:flex-row-reverse" : ""
            } ${feature.align === "center" ? "md:flex-col md:text-center" : ""}`}
          >
            <div className={`flex-1 space-y-6 ${feature.align === "center" ? "items-center" : ""}`}>
              <div className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-2">
                Feature {feature.id}
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-black">
                {feature.title.split(" ").map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </h2>
              <p className={`text-gray-500 text-lg leading-relaxed max-w-md ${feature.align === "center" ? "mx-auto" : ""}`}>
                {feature.description}
              </p>
              <div className={`w-20 h-1 bg-black ${feature.align === "center" ? "mx-auto" : ""}`} />
            </div>

            <div className="flex-1 w-full flex justify-center">
              <div className="relative group w-full max-w-md aspect-video border border-black/10 bg-gray-50 backdrop-blur-sm p-8 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-black/10" />

                <div className="relative z-10">
                  <span className="text-6xl font-black text-gray-200 group-hover:text-gray-300 transition-colors duration-500">
                    {feature.id}
                  </span>
                  <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mt-2">
                    {feature.title}
                  </h3>
                </div>

                <feature.icon className="w-12 h-12 text-gray-300 group-hover:text-gray-500 transition-colors self-end" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
