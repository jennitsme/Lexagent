import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Send, 
  Repeat, 
  History, 
  Settings, 
  LogOut, 
  Wallet,
  Bell,
  Bot,
  Menu,
  X
} from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { Link, Outlet, useLocation } from "react-router-dom";
import { PhantomLogo } from "../components/icons/PhantomLogo";
import { MetaMaskLogo } from "../components/icons/MetaMaskLogo";
import { WalletModal } from "../components/WalletModal";

export default function DashboardLayout() {
  const { address, walletType, openModal, isConnected } = useWallet();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const formatAddress = (addr: string | null) => {
    if (!addr) return "Not Connected";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Bot, label: "Agents", path: "/dashboard/agents" },
    { icon: Send, label: "Transfer", path: "/dashboard/transfer" },
    { icon: Repeat, label: "Swap", path: "/dashboard/swap" },
    { icon: History, label: "History", path: "/dashboard/history" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden">
      <WalletModal />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r border-black/5 bg-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-black/5">
          <div className="flex items-center gap-3">
            <img src="/logo11.png" alt="LEXAGENT" className="w-8 h-8 rounded-sm object-cover" />
            <span className="font-bold text-xl tracking-wider">LEXAGENT</span>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.label}
                to={item.path}
                onClick={closeSidebar}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? "bg-black text-white" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-black/5">
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-black transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 relative w-full">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg bg-white border border-black/5 hover:bg-gray-100 transition-colors lg:hidden shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate text-black">
                  {navItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
                </h1>
                <p className="text-gray-400 text-sm hidden sm:block">Welcome back, Agent.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button className="p-2 rounded-full bg-white border border-black/5 hover:bg-gray-100 text-gray-400 hover:text-black transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
              </button>
              
              <button
                onClick={!isConnected ? openModal : undefined}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white rounded-full border border-black/10 ${!isConnected ? 'cursor-pointer hover:bg-gray-50 hover:border-black/20 transition-all' : ''}`}
              >
                {walletType === 'phantom' ? (
                  <PhantomLogo className="w-5 h-5" />
                ) : walletType === 'metamask' ? (
                  <MetaMaskLogo className="w-5 h-5" />
                ) : (
                  <Wallet className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-mono text-xs sm:text-sm hidden sm:inline text-gray-600">{formatAddress(address)}</span>
              </button>
            </div>
          </header>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
