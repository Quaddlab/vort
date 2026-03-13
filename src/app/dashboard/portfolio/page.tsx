"use client";

import { Lock, Unlock, Clock, Wallet } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { useBalances } from "@/hooks/useBalances";
import { useEpoch } from "@/hooks/useEpoch";
import { formatBalance, redeemTokens, claimYield } from "@/lib/stacks";
import Link from "next/link";

type TxState = "idle" | "pending" | "success";

export default function PortfolioPage() {
  const { address } = useWallet();
  const { addToast } = useToast();
  const { balances, loading, refetch } = useBalances(address);
  const epoch = useEpoch();
  const [txState, setTxState] = useState<TxState>("idle");
  const [txId, setTxId] = useState<string | null>(null);

  const ptBalance = balances?.pt ?? 0;
  const ytBalance = balances?.yt ?? 0;
  const claimableYield = balances?.claimableYield ?? 0;

  function handleRedeem() {
    if (ptBalance <= 0) return;
    setTxState("pending");
    redeemTokens(
      (ptBalance / 1e8).toString(),
      (data) => {
        setTxId(data.txId);
        setTxState("success");
        addToast(
          "success",
          "Redemption submitted!",
          "Your PT tokens are being redeemed for sBTC.",
          data.txId,
        );
        refetch();
      },
      () => {
        setTxState("idle");
        addToast("info", "Cancelled", "You cancelled the wallet signing.");
      },
    );
  }

  function handleClaimYield() {
    setTxState("pending");
    claimYield(
      (data) => {
        setTxId(data.txId);
        setTxState("success");
        addToast(
          "success",
          "Yield claim submitted!",
          "Your accrued yield is being claimed.",
          data.txId,
        );
        refetch();
      },
      () => {
        setTxState("idle");
        addToast("info", "Cancelled", "You cancelled the wallet signing.");
      },
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
            Your Portfolio
          </h1>
          <p className="text-slate-400">
            Manage your principal and yield positions for the active epoch.
          </p>
        </div>
      </div>

      {txState === "success" && txId && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
          <span className="text-emerald-400 font-medium text-sm">
            Transaction submitted!{" "}
            <a
              href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              View on Explorer →
            </a>
          </span>
        </div>
      )}

      {!loading && ptBalance === 0 && ytBalance === 0 ? (
        <div className="bg-[#0a0a0c] border border-[#1a1a24] p-12 rounded-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 font-bold text-xl mx-auto mb-6">
            V
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">
            No Positions Yet
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Deposit sBTC to receive Principal Tokens (PT) and Yield Tokens (YT).
            Your positions will appear here.
          </p>
          <Link
            href="/dashboard/deposit"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Make First Deposit
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PT Position */}
            <div className="bg-[#0a0a0c] border border-[#1a1a24] p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-px bg-[#1a1a24] group-hover:bg-emerald-500/30 transition-colors" />
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#111118] border border-[#1a1a24] flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-sm">
                      PT
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Principal Tokens</h3>
                    <p className="text-slate-500 text-xs font-mono">
                      Epoch 120
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2.5 py-1 rounded border text-xs flex items-center gap-1.5 ${
                    epoch.isMature
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  {epoch.loading ? (
                    <Clock size={12} className="animate-spin" />
                  ) : epoch.isMature ? (
                    <Unlock size={12} />
                  ) : (
                    <Lock size={12} />
                  )}
                  {epoch.loading
                    ? "Loading..."
                    : epoch.isMature
                      ? "Matured"
                      : "Locked"}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-4xl font-mono text-white tracking-tight mb-1">
                  {loading ? "—" : formatBalance(ptBalance)}
                </p>
                <p className="text-slate-500 text-sm">
                  {epoch.loading
                    ? "Fetching maturity data..."
                    : epoch.isMature
                      ? "Tokens are fully matured. Redeem 1:1 for sBTC now."
                      : `Redeems 1:1 for sBTC • ~${epoch.blocksRemaining} blocks left (${new Date(epoch.estimatedMaturityDate).toLocaleDateString()})`}
                </p>
              </div>

              <button
                onClick={handleRedeem}
                disabled={
                  ptBalance === 0 ||
                  txState === "pending" ||
                  (!epoch.isMature && !epoch.loading)
                }
                className="w-full bg-[#111118] border border-[#1a1a24] text-slate-400 hover:text-white hover:border-emerald-500/30 py-3 rounded-xl text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {txState === "pending"
                  ? "Waiting for wallet..."
                  : epoch.isMature
                    ? "Redeem sBTC"
                    : "Redeem sBTC (After Maturity)"}
              </button>
            </div>

            {/* YT Position */}
            <div className="bg-[#0a0a0c] border border-[#1a1a24] p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-px bg-[#1a1a24] group-hover:bg-indigo-500/30 transition-colors" />
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#111118] border border-[#1a1a24] flex items-center justify-center">
                    <span className="text-indigo-400 font-bold text-sm">
                      YT
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Yield Tokens</h3>
                    <p className="text-slate-500 text-xs font-mono">
                      Epoch 120
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                  ↗ Earning
                </div>
              </div>

              <div className="mb-8">
                <p className="text-4xl font-mono text-white tracking-tight mb-1">
                  {loading ? "—" : formatBalance(ytBalance)}
                </p>
                <p className="text-slate-500 text-sm flex flex-col gap-1 mt-2">
                  <span>Accruing yield from Zest Protocol.</span>
                  {ytBalance > 0 && !loading && (
                    <span className="text-emerald-400 font-medium">
                      ✓ {formatBalance(claimableYield)} sBTC available to claim
                    </span>
                  )}
                </p>
              </div>

              <button
                onClick={handleClaimYield}
                disabled={
                  ytBalance === 0 || claimableYield <= 0 || txState === "pending"
                }
                className="w-full bg-[#111118] border border-[#1a1a24] text-slate-400 hover:text-white hover:border-indigo-500/30 py-3 rounded-xl text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {txState === "pending"
                  ? "Waiting for wallet..."
                  : ytBalance === 0
                    ? "Deposit to Earn Yield"
                    : claimableYield <= 0
                      ? "No Yield Available"
                      : `Claim ${formatBalance(claimableYield)} sBTC`}
              </button>
            </div>
          </div>

          {/* Position Info */}
          <div className="bg-[#0a0a0c] border border-[#1a1a24] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#1a1a24]">
              <h3 className="text-white font-medium">Position Summary</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">PT Balance</span>
                <span className="text-white font-mono">
                  {formatBalance(ptBalance)} PT
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">YT Balance</span>
                <span className="text-white font-mono">
                  {formatBalance(ytBalance)} YT
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#1a1a24] pt-3">
                <span className="text-slate-400">Epoch Status</span>
                <span className="text-emerald-400">Active</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
