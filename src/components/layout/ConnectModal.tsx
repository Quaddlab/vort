"use client";

import { useWallet } from "@/context/WalletContext";
import { X, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

export function ConnectModal() {
  const { isConnectModalOpen, setIsConnectModalOpen, connectDirectly } =
    useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnectModalOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsConnectModalOpen(false)}
      />

      {/* Modal Content */}
      <div className="relative bg-[#0a0a0c] border border-[#1a1a24] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a24]">
          <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
          <button
            onClick={() => setIsConnectModalOpen(false)}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wallets */}
        <div className="p-6 space-y-3">
          {/* Leather Wallet */}
          <button
            onClick={() => connectDirectly("leather")}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-[#111118] border border-[#1a1a24] hover:border-indigo-500/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold border border-orange-500/20">
                L
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Leather Wallet</p>
                <p className="text-slate-400 text-xs mt-0.5">leather.io</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeof window !== "undefined" &&
              (window as any).LeatherProvider ? (
                <div className="text-xs font-semibold px-3 py-1.5 rounded bg-[#1a1a24] text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  Connect
                </div>
              ) : (
                <div className="text-xs font-semibold px-3 py-1.5 rounded bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors flex items-center gap-1">
                  Install <ExternalLink size={10} />
                </div>
              )}
            </div>
          </button>

          {/* Xverse Wallet */}
          <button
            onClick={() => connectDirectly("xverse")}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-[#111118] border border-[#1a1a24] hover:border-indigo-500/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold border border-orange-700/20">
                X
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Xverse Wallet</p>
                <p className="text-slate-400 text-xs mt-0.5">xverse.app</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeof window !== "undefined" &&
              ((window as any).XverseProviders?.StacksProvider ||
                (window as any).BitcoinProvider) ? (
                <div className="text-xs font-semibold px-3 py-1.5 rounded bg-[#1a1a24] text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  Connect
                </div>
              ) : (
                <div className="text-xs font-semibold px-3 py-1.5 rounded bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors flex items-center gap-1">
                  Install <ExternalLink size={10} />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1a1a24] bg-[#111118] text-center">
          <p className="text-slate-500 text-xs flex items-center justify-center gap-1.5">
            New to Stacks?
            <a
              href="https://leather.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Get Leather <ExternalLink size={10} />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
