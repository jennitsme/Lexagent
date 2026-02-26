import { motion } from "motion/react";
import { Bot, Key, MessageSquare, Save, Shield, Terminal, Zap } from "lucide-react";
import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";

export default function CreateAgent() {
  const { address, isConnected, openModal } = useWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    telegramToken: "",
    allowedChatId: "",
    llmProvider: "gemini",
    llmApiKey: "",
    systemPrompt: "You are a helpful AI assistant named Lumi. You are concise, witty, and knowledgeable about crypto.",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      openModal();
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create agent');

      setStatus({ type: 'success', message: `Agent ${data.botName} deployed successfully! You can now chat with it on Telegram.` });
      // Clear sensitive fields
      setFormData(prev => ({ ...prev, telegramToken: '', llmApiKey: '' }));
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/50">
          <Shield className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold">Access Restricted</h2>
        <p className="text-gray-400 max-w-md">
          Please connect your wallet to access the OpenClaw Agent Factory.
          Only verified wallet owners can deploy autonomous agents.
        </p>
        <button 
          onClick={openModal}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
          <Bot className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Deploy New Agent</h1>
          <p className="text-gray-400">Configure your autonomous neural entity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Section */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              Agent Identity
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Agent Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. LumiBot_01"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">System Prompt (Personality)</label>
                <textarea 
                  required
                  value={formData.systemPrompt}
                  onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-blue-500/50 focus:outline-none transition-colors font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Integration Section */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              Telegram Integration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bot Token</label>
                <input 
                  type="password" 
                  required
                  value={formData.telegramToken}
                  onChange={e => setFormData({...formData, telegramToken: e.target.value})}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-green-500/50 focus:outline-none transition-colors font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Get this from @BotFather on Telegram</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Allowed Chat ID (Optional)</label>
                <input 
                  type="text" 
                  value={formData.allowedChatId}
                  onChange={e => setFormData({...formData, allowedChatId: e.target.value})}
                  placeholder="e.g. 123456789"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-green-500/50 focus:outline-none transition-colors font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Restrict the bot to only respond to this user/group ID</p>
              </div>
            </div>
          </div>

          {/* Brain Section */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Neural Engine (LLM)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Provider</label>
                <div className="grid grid-cols-3 gap-4">
                  {['gemini', 'openai', 'anthropic'].map(provider => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setFormData({...formData, llmProvider: provider})}
                      className={`p-3 rounded-xl border capitalize transition-all ${
                        formData.llmProvider === provider 
                          ? 'bg-purple-600/20 border-purple-500 text-white' 
                          : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    value={formData.llmApiKey}
                    onChange={e => setFormData({...formData, llmApiKey: e.target.value})}
                    placeholder={`Enter your ${formData.llmProvider} API key`}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 focus:border-purple-500/50 focus:outline-none transition-colors font-mono"
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {status && (
            <div className={`p-4 rounded-xl border ${
              status.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {status.message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Deploy Agent
              </>
            )}
          </button>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20">
            <h3 className="font-bold mb-4">Deployment Guide</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">1</span>
                <span>Create a bot on Telegram via @BotFather and get the token.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">2</span>
                <span>Get your API key from your preferred AI provider (OpenAI, Google, Anthropic).</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">3</span>
                <span>Fill in the details and click Deploy. The system will automatically set up the webhook.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="font-bold mb-2 text-yellow-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Note
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your API keys are stored securely and only used to power your agent. 
              We recommend creating restricted API keys specifically for this application.
            </p>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
