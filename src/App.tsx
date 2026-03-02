/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { OpenClaw } from "./components/OpenClaw";
import { HowItWorks } from "./components/HowItWorks";
import { Footer } from "./components/Footer";
import { WalletProvider } from "./context/WalletContext";
import { WalletModal } from "./components/WalletModal";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Transfer from "./pages/Transfer";
import Swap from "./pages/Swap";
import History from "./pages/History";
import Settings from "./pages/Settings";
import CreateAgent from "./pages/CreateAgent";

function LandingPage() {
  return (
    <div className="bg-white min-h-screen text-black selection:bg-black/10">
      <Navbar />
      <WalletModal />
      <main>
        <Hero />
        <Features />
        <OpenClaw />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <WalletProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="agents" element={<CreateAgent />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="swap" element={<Swap />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </WalletProvider>
    </Router>
  );
}
