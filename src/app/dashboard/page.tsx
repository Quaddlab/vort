"use client";

import { ArrowRight, ArrowUpRight, Clock, Lock, Wallet } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { useBalances } from "@/hooks/useBalances";
import { formatBalance } from "@/lib/stacks";

export default function OverviewPage() {
  const { address } = useWallet();
  const { balances, loading } = useBalances(address);

  const ptBalance = balances?.pt ?? 0;
  const ytBalance = balances?.yt ?? 0;
  const sbtcBalance = balances?.sbtc ?? 0;
  const totalSbtcValue = sbtcBalance + ptBalance; // PT redeems 1:1 to sBTC

  const btcPrice = 66_600; // approximate BTC price for display
  const usdValue = (totalSbtcValue / 1e8) * btcPrice;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
            Overview
          </h1>
          <p className="text-slate-400">Welcome back to your Vort dashboard.</p>
        </div>
        <Link
          href="/dashboard/deposit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Wallet size={16} />
          Deposit sBTC
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balances */}
        <div className="bg-[#0a0a0c] border border-[#1a1a24] p-6 rounded-2xl col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px] -mr-20 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />

          <h3 className="text-slate-400 text-sm font-medium mb-6 relative z-10">
            Total Balance
          </h3>
          <div className="text-5xl font-mono text-white mb-2 tracking-tight relative z-10">
            {loading ? (
              <span className="text-slate-600 animate-pulse">—</span>
            ) : (
              <>
                {formatBalance(sbtcBalance)}{" "}
                <span className="text-2xl text-slate-500">sBTC</span>
              </>
            )}
          </div>
          <p className="text-slate-500 text-sm relative z-10">
            ≈ $
            {usdValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            USD
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#1a1a24] pt-6 relative z-10">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Principal (PT)
              </p>
              <p className="text-white font-mono text-xl">
                {loading ? "—" : formatBalance(ptBalance)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Yield (YT)
              </p>
              <p className="text-white font-mono text-xl">
                {loading ? "—" : formatBalance(ytBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="bg-[#0a0a0c] border border-[#1a1a24] p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-medium mb-6">
              Global Yield
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-mono text-emerald-400">5.42</span>
              <span className="text-emerald-500/50">%</span>
            </div>
            <p className="text-slate-500 text-xs mt-2 border-l-2 border-[#1a1a24] pl-2">
              Implied fixed APY tracking Zest Protocol
            </p>
          </div>

          <Link
            href="/dashboard/protocol"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 mt-6 transition-colors w-fit cursor-pointer relative z-10"
          >
            View Protocol Stats
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Positions */}
        <div className="bg-[#0a0a0c] border border-[#1a1a24] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#1a1a24] flex justify-between items-center">
            <h3 className="text-white font-medium">Active Positions</h3>
            <Link
              href="/dashboard/portfolio"
              className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer flex items-center gap-1"
            >
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="p-6 space-y-4">
            {ptBalance === 0 && ytBalance === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm mb-3">
                  No active positions yet
                </p>
                <Link
                  href="/dashboard/deposit"
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium cursor-pointer"
                >
                  Make your first deposit →
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-4 bg-[#111118] border border-[#1a1a24] rounded-xl hover:border-[#2a2a34] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                      <span className="text-emerald-400 text-xs font-bold leading-none">
                        PT
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Epoch 120 PTs
                      </p>
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                        <Lock size={10} /> Locked until maturity
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono text-lg group-hover:text-emerald-400 transition-colors">
                      {formatBalance(ptBalance)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#111118] border border-[#1a1a24] rounded-xl hover:border-[#2a2a34] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center">
                      <span className="text-indigo-400 text-xs font-bold leading-none">
                        YT
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Epoch 120 YTs
                      </p>
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                        <Clock size={10} /> Floating • earning yield
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono text-lg group-hover:text-indigo-400 transition-colors">
                      {formatBalance(ytBalance)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#0a0a0c] border border-[#1a1a24] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#1a1a24]">
            <h3 className="text-white font-medium">Recent Activity</h3>
          </div>
          <div className="divide-y divide-[#1a1a24]">
            {ptBalance === 0 && ytBalance === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-500 text-sm">
                  No transactions yet. Deposit sBTC to get started.
                </p>
              </div>
            ) : (
              <div className="p-4 px-6 flex items-center justify-between hover:bg-[#111118] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#111118] border border-[#1a1a24] flex items-center justify-center">
                    <Wallet size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      Position Active
                    </p>
                    <p className="text-slate-500 text-xs">Current epoch</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono text-sm">
                    {formatBalance(ptBalance)} PT
                  </p>
                  <p className="text-emerald-400 text-xs">Active</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
