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
    systemPrompt: "You are a helpful AI assistant. You are concise, witty, and knowledgeable about crypto.",
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
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border border-black/10">
          <Shield className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-black">Access Restricted</h2>
        <p className="text-gray-500 max-w-md">
          Please connect your wallet to access the Agent Factory.
          Only verified wallet owners can deploy autonomous agents.
        </p>
        <button 
          onClick={openModal}
          className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all"
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
        <div className="p-3 bg-gray-100 rounded-xl border border-black/10">
          <Bot className="w-8 h-8 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-black">Deploy New Agent</h1>
          <p className="text-gray-500">Configure your autonomous neural entity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-black/10 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-black">
              <Terminal className="w-5 h-5 text-gray-500" />
              Agent Identity
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Agent Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. LexagentBot_01"
                  className="w-full bg-gray-50 border border-black/10 rounded-xl p-3 focus:border-black/30 focus:outline-none transition-colors text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">System Prompt (Personality)</label>
                <textarea 
                  required
                  value={formData.systemPrompt}
                  onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
                  rows={4}
                  className="w-full bg-gray-50 border border-black/10 rounded-xl p-3 focus:border-black/30 focus:outline-none transition-colors font-mono text-sm text-black"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/10 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-black">
              <MessageSquare className="w-5 h-5 text-green-500" />
              Telegram Integration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Bot Token</label>
                <input 
                  type="password" 
                  required
                  value={formData.telegramToken}
                  onChange={e => setFormData({...formData, telegramToken: e.target.value})}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full bg-gray-50 border border-black/10 rounded-xl p-3 focus:border-green-500/50 focus:outline-none transition-colors font-mono text-black"
                />
                <p className="text-xs text-gray-400 mt-1">Get this from @BotFather on Telegram</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Allowed Chat ID (Optional)</label>
                <input 
                  type="text" 
                  value={formData.allowedChatId}
                  onChange={e => setFormData({...formData, allowedChatId: e.target.value})}
                  placeholder="e.g. 123456789"
                  className="w-full bg-gray-50 border border-black/10 rounded-xl p-3 focus:border-green-500/50 focus:outline-none transition-colors font-mono text-black"
                />
                <p className="text-xs text-gray-400 mt-1">Restrict the bot to only respond to this user/group ID</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/10 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-black">
              <Zap className="w-5 h-5 text-purple-500" />
              Neural Engine (LLM)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Provider</label>
                <div className="grid grid-cols-3 gap-4">
                  {['gemini', 'openai', 'anthropic'].map(provider => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setFormData({...formData, llmProvider: provider})}
                      className={`p-3 rounded-xl border capitalize transition-all ${
                        formData.llmProvider === provider 
                          ? 'bg-black border-black text-white' 
                          : 'bg-gray-50 border-black/10 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">API Key</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    value={formData.llmApiKey}
                    onChange={e => setFormData({...formData, llmApiKey: e.target.value})}
                    placeholder={`Enter your ${formData.llmProvider} API key`}
                    className="w-full bg-gray-50 border border-black/10 rounded-xl p-3 pl-10 focus:border-black/30 focus:outline-none transition-colors font-mono text-black"
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {status && (
            <div className={`p-4 rounded-xl border ${
              status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {status.message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Deploy Agent
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gray-50 border border-black/10">
            <h3 className="font-bold mb-4 text-black">Deployment Guide</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shrink-0">1</span>
                <span>Create a bot on Telegram via @BotFather and get the token.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shrink-0">2</span>
                <span>Get your API key from your preferred AI provider (OpenAI, Google, Anthropic).</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shrink-0">3</span>
                <span>Fill in the details and click Deploy. The system will automatically set up the webhook.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/10">
            <h3 className="font-bold mb-2 text-gray-700 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Note
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your API keys are stored securely and only used to power your agent. 
              We recommend creating restricted API keys specifically for this application.
            </p>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
