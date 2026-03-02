"use client";

import { Menu, LogOut } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";

interface TopNavProps {
  onOpenSidebar: () => void;
}

export function TopNav({ onOpenSidebar }: TopNavProps) {
  const { address, isConnected, connect, disconnect } = useWallet();

  const truncatedAddress = address
    ? `${address.slice(0, 5)}…${address.slice(-4)}`
    : "";

  return (
    <header className="h-16 bg-[#0a0a0c] border-b border-[#1a1a24] px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="text-slate-400 hover:text-white transition-colors p-1 -ml-1 cursor-pointer"
        >
          <Menu size={24} />
        </button>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 cursor-pointer ml-2"
        >
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            V
          </div>
          <span className="text-white font-semibold tracking-tight hidden sm:block">
            Vort
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#111118] border border-[#1a1a24] rounded-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Epoch 120
          </span>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-[#111118] border border-[#1a1a24] rounded-md text-xs font-mono text-slate-300">
              {truncatedAddress}
            </div>
            <button
              onClick={disconnect}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Disconnect"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            className="bg-white hover:bg-slate-200 text-black px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
