"use client";

import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { Wallet } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isConnected, isLoading, connect } = useWallet();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
            V
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">
            Connect to Vort
          </h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Connect your Stacks wallet to access the dashboard and manage your
            fixed-income positions.
          </p>
          <button
            onClick={connect}
            className="bg-white hover:bg-slate-200 text-black px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-2 mx-auto"
          >
            <Wallet size={18} />
            Connect Wallet
          </button>
          <p className="text-slate-600 text-xs mt-6">
            Supports Leather &amp; Xverse wallets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col">
      <TopNav onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
