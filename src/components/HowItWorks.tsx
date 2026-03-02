import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "ENTER TRANSFER DETAILS",
    description: "Navigate to the \"Transfer\" tab, select your currency, and enter the recipient's wallet address and the amount you want to send privately.",
    action: "TRANSFER FORM",
  },
  {
    id: "02",
    title: "CREATE TRANSACTION",
    description: "Click \"Create Transaction\" to generate a private deposit address. Review the fee estimate and transaction details before proceeding.",
    action: "TRANSACTION CREATION",
  },
  {
    id: "03",
    title: "INITIATE PRIVATE TRANSFER",
    description: "Click \"Create Transaction\" to initiate. Your crypto will be routed through our secure exchange infrastructure, ensuring complete privacy.",
    action: "PRIVATE ROUTING",
  },
  {
    id: "04",
    title: "RECEIVE CONFIRMATION",
    description: "Once processed, you'll receive confirmation. The recipient receives funds with no traceable connection to your original transaction.",
    action: "COMPLETE",
    icon: Check,
  },
];

export function HowItWorks() {
  return (
    <section id="transfer" className="py-32 px-6 bg-white relative">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-black mb-4">
            HOW IT<br />WORKS
          </h2>
          <div className="w-24 h-1 bg-black mx-auto" />
        </motion.div>

        <div className="relative border-l border-black/10 ml-4 md:ml-0 space-y-24">
          {steps.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12 md:pl-24"
            >
              <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-black rounded-full" />
              
              <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="space-y-4">
                  <div className="text-gray-400 font-mono text-xs tracking-widest uppercase">
                    Step {step.title.split(" ")[0]}
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-none text-black">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                  <div className="w-12 h-1 bg-black" />
                </div>

                <div className="relative group">
                  <div className="border border-black/10 bg-gray-50 p-8 h-40 flex flex-col justify-center items-center relative overflow-hidden transition-all hover:border-black/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {step.icon ? (
                      <step.icon className="w-12 h-12 text-black mb-2" />
                    ) : (
                      <ArrowRight className="w-8 h-8 text-black mb-2 group-hover:translate-x-2 transition-transform" />
                    )}
                    
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                      {step.action}
                    </span>

                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black/20" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black/20" />
                  </div>
                  
                  <div className="absolute -top-10 -right-4 text-9xl font-black text-black/5 pointer-events-none select-none">
                    {step.id}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
