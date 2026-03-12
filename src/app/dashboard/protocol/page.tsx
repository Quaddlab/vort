"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Clock,
  LineChart,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { useBalances } from "@/hooks/useBalances";
import { useZestApy } from "@/hooks/useZestApy";
import { useEpoch } from "@/hooks/useEpoch";
import { formatBalance, addLiquidity, waitForTransaction } from "@/lib/stacks";

const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || "ST3SJNP6KGJVT5ZBS1Q7T8RQVMFAZ16W80ZST1W44";

export default function ProtocolPage() {
  const { address } = useWallet();
  const { addToast } = useToast();
  const { balances, loading } = useBalances(address);
  const epoch = useEpoch();
  const zest = useZestApy();
  const [seedState, setSeedState] = useState<"idle" | "pending" | "submitted">("idle");

  const isDeployer = address === DEPLOYER;

  const ptBalance = balances?.pt ?? 0;
  const ytBalance = balances?.yt ?? 0;

  // Implied fixed yield derived from Zest supply rate (PT discount)
  const impliedFixedYield = zest.loading
    ? "—"
    : (zest.supplyApyPercent * 0.9).toFixed(2);
  const variableYield = zest.loading ? "—" : zest.supplyApyPercent.toFixed(2);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
            Protocol Health
          </h1>
          <p className="text-slate-400">
            Global metrics and system performance across the Vort ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0a0a0c] border border-emerald-500/20 px-4 py-2 rounded-lg text-emerald-400 text-sm font-medium">
          <ShieldCheck size={16} />
          System Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric Cards */}
        {[
          {
            label: "Your PT Balance",
            value: loading ? "—" : formatBalance(ptBalance),
            suffix: "PT",
            change: ptBalance > 0 ? "Active" : "No positions",
            icon: BarChart3,
          },
          {
            label: "Implied Fixed Yield",
            value: impliedFixedYield,
            suffix: "%",
            change:
              zest.source === "zest-v2-mainnet"
                ? "🟢 Live from Zest"
                : "Tracking Zest",
            icon: LineChart,
          },
          {
            label: "Variable Yield (Zest)",
            value: variableYield,
            suffix: "%",
            change:
              zest.source === "zest-v2-mainnet"
                ? "🟢 Live APY"
                : "Estimated APY",
            icon: Activity,
          },
          {
            label: `Epoch ${epoch.epochId} Status`,
            value: epoch.loading ? "—" : epoch.isMature ? "Matured" : "Active",
            suffix: "",
            change: epoch.loading
              ? "Fetching..."
              : epoch.isMature
                ? "Redemptions Open"
                : `~${epoch.blocksRemaining} blocks left`,
            icon: Clock,
          },
        ].map((metric, i) => (
          <div
            key={i}
            className="bg-[#0a0a0c] border border-[#1a1a24] p-6 rounded-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 text-sm font-medium">
                {metric.label}
              </span>
              <metric.icon size={16} className="text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-mono text-white tracking-tight">
                {metric.value}
              </span>
              <span className="text-slate-500 text-sm">{metric.suffix}</span>
            </div>
            <div className="text-xs font-mono text-slate-500">
              {metric.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Distribution */}
        <div className="bg-[#0a0a0c] border border-[#1a1a24] p-6 rounded-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-medium">Your Token Distribution</h3>
            <a
              href={`https://explorer.hiro.so/address/${address}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              View on Explorer <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-[#1a1a24] pb-4">
              <div>
                <p className="text-emerald-400 text-sm font-bold mb-1">
                  Principal Tokens (PT)
                </p>
                <span className="text-slate-400 text-sm">
                  Redeemable 1:1 for sBTC at maturity
                </span>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-xl">
                  {loading ? "—" : formatBalance(ptBalance)} PT
                </p>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-indigo-400 text-sm font-bold mb-1">
                  Yield Tokens (YT)
                </p>
                <span className="text-slate-400 text-sm">
                  Earns floating yield from Zest Protocol
                </span>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-xl">
                  {loading ? "—" : formatBalance(ytBalance)} YT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-[#0a0a0c] border border-[#1a1a24] p-6 rounded-2xl flex flex-col">
          <h3 className="text-white font-medium mb-6">Deployed Contracts</h3>
          <div className="flex-1 space-y-4">
            {[
              { name: "tokenizer-v2", desc: "Deposit & Redeem" },
              { name: "pt-token", desc: "Principal Token" },
              { name: "yt-token", desc: "Yield Token" },
              { name: "pt-amm", desc: "AMM Pool" },
              { name: "yield-router-v2", desc: "Yield Distribution" },
              { name: "sbtc-token", desc: "Test sBTC" },
            ].map((c, i) => (
              <a
                key={i}
                href={`https://explorer.hiro.so/txid/${process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || "ST3SJNP6KGJVT5ZBS1Q7T8RQVMFAZ16W80ZST1W44"}.${c.name}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-between items-center group cursor-pointer hover:bg-[#111118] p-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-white font-mono text-sm">{c.name}</span>
                  <span className="text-slate-500 text-xs">{c.desc}</span>
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Admin: Seed AMM Pool */}
      {isDeployer && (
        <div className="bg-[#0a0a0c] border border-amber-500/20 p-6 rounded-2xl">
          <h3 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
            <ShieldCheck size={16} /> Admin: Seed AMM Pool
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Add 1 sBTC + 1 PT of initial liquidity to the pt-amm pool so users can trade.
            This uses programmatic post conditions (bypasses Sandbox UI limitation).
          </p>
          <button
            onClick={() => {
              setSeedState("pending");
              addLiquidity(
                "1",
                "1",
                async (data) => {
                  setSeedState("submitted");
                  addToast("info", "Seeding pool...", "Awaiting confirmation...", data.txId);
                  const status = await waitForTransaction(data.txId);
                  if (status === "success") {
                    setSeedState("idle");
                    addToast("success", "Pool seeded!", "The AMM pool is now open for trading.", data.txId);
                  } else {
                    setSeedState("idle");
                    addToast("error", "Seeding failed", "Transaction aborted on-chain.", data.txId);
                  }
                },
                () => {
                  setSeedState("idle");
                  addToast("info", "Cancelled", "You cancelled the wallet signing.");
                },
              );
            }}
            disabled={seedState !== "idle"}
            className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {seedState === "pending" ? (
              <><Loader2 size={16} className="animate-spin" /> Waiting for wallet...</>
            ) : seedState === "submitted" ? (
              <><Loader2 size={16} className="animate-spin" /> Awaiting confirmation...</>
            ) : (
              "Seed 1 sBTC + 1 PT into AMM Pool"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
