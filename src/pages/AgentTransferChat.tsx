import { motion } from "motion/react";
import { Bot, Send, Shield, Sparkles, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { sendSol } from "../lib/solana";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

export default function AgentTransferChat() {
  const { address, isConnected, openModal, signAndSendTransaction, walletType } = useWallet();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text: "Hi. I’m Lexa Agent. Tell me what to do, for example: send 0.1 SOL to <destination_wallet_address>",
    },
  ]);

  const runAgent = async () => {
    if (!input.trim() || !address) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const response = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Agent failed");

      if (data.intent === "send_sol" && data.amountSol && data.toAddress) {
        const tx = await sendSol(address, data.toAddress, data.amountSol);
        const sig = await signAndSendTransaction(tx);
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            text: `Done. Sent ${data.amountSol} SOL to ${data.toAddress}. Signature: ${sig.slice(0, 8)}...${sig.slice(-8)}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            text: data.reply || "I can help. Try: send 0.1 SOL to <wallet_address>",
          },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: `Error: ${error.message || "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || walletType !== "phantom") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-sky-100/70 rounded-full flex items-center justify-center border border-sky-200/70">
          <Shield className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-3xl font-bold text-blue-700">Connect Phantom Wallet</h2>
        <p className="text-blue-600 max-w-md">
          Agent chat transfer can execute on-chain SOL transfers from your wallet after you approve the transaction.
        </p>
        <button onClick={openModal} className="px-8 py-3 lex-accent-bg text-white font-bold rounded-xl transition-all">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="p-6 rounded-2xl bg-white border border-sky-200/70 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-sky-100/70 border border-sky-200/70">
            <Bot className="w-5 h-5 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-blue-700">Agent Transfer Chat</h1>
        </div>
        <p className="text-blue-600 text-sm">
          Natural language transfer assistant. Example: “send 0.1 sol to &lt;destination_wallet_address&gt;”.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-200/70 bg-white overflow-hidden">
        <div className="h-[440px] overflow-y-auto p-4 space-y-3 bg-sky-50/40">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "lex-accent-bg text-white"
                    : "bg-white border border-sky-200/70 text-blue-700"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-white border border-sky-200/70 text-blue-600 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Agent is thinking...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-sky-200/70 bg-white">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  runAgent();
                }
              }}
              placeholder="Type transfer instruction..."
              className="flex-1 bg-sky-50/70 border border-sky-200/70 rounded-xl px-4 py-3 text-blue-700 placeholder:text-blue-400 focus:outline-none focus:border-sky-400/70"
            />
            <button
              onClick={runAgent}
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl lex-accent-bg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </div>
          <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Every transfer still requires wallet signature approval.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
