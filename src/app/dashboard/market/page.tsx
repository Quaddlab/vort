"use client";

import {
  ArrowDownUp,
  BarChart,
  Settings2,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { useBalances } from "@/hooks/useBalances";
import {
  formatBalance,
  swapSbtcForPt,
  swapPtForSbtc,
  toMicroUnits,
  waitForTransaction,
} from "@/lib/stacks";

type TxState = "idle" | "pending" | "submitted" | "success" | "error";

export default function MarketPage() {
  const { address } = useWallet();
  const { addToast } = useToast();
  const { balances, loading, refetch } = useBalances(address);
  const [payAmount, setPayAmount] = useState("");
  const [direction, setDirection] = useState<"sbtc-to-pt" | "pt-to-sbtc">(
    "sbtc-to-pt",
  );
  const [txState, setTxState] = useState<TxState>("idle");
  const [txId, setTxId] = useState<string | null>(null);

  const sbtcBalance = balances?.sbtc ?? 0;
  const ptBalance = balances?.pt ?? 0;

  const payBalance = direction === "sbtc-to-pt" ? sbtcBalance : ptBalance;
  const receiveBalance = direction === "sbtc-to-pt" ? ptBalance : sbtcBalance;

  // PT trades at ~0.985 sBTC (slight discount)
  const exchangeRate = direction === "sbtc-to-pt" ? 1.015 : 0.985;
  const receiveAmount =
    Number(payAmount) > 0
      ? (Number(payAmount) * exchangeRate).toFixed(4)
      : "0.0";

  const parsedAmount = Number(payAmount) || 0;
  const microPayAmount = toMicroUnits(payAmount);
  const isValidAmount = parsedAmount > 0 && microPayAmount <= payBalance;

  function handleSwap() {
    if (!isValidAmount) return;
    setTxState("pending");

    const minOut = Math.floor(toMicroUnits(receiveAmount) * 0.995); // 0.5% slippage

    if (direction === "sbtc-to-pt") {
      swapSbtcForPt(
        payAmount,
        minOut,
        async (data) => {
          setTxId(data.txId);
          setTxState("submitted");
          setPayAmount("");
          addToast(
            "info",
            "Swap broadcasted",
            `Swapping ${payAmount} sBTC for PT. Awaiting confirmation...`,
            data.txId,
          );
          
          const status = await waitForTransaction(data.txId);
          if (status === "success") {
            setTxState("success");
            addToast("success", "Swap confirmed!", "Your transaction was successful.", data.txId);
            refetch();
          } else {
            setTxState("error");
            addToast("error", "Swap failed", "Your transaction failed on-chain.", data.txId);
          }
        },
        () => {
          setTxState("idle");
          addToast("info", "Cancelled", "You cancelled the wallet signing.");
        },
      );
    } else {
      swapPtForSbtc(
        payAmount,
        minOut,
        async (data) => {
          setTxId(data.txId);
          setTxState("submitted");
          setPayAmount("");
          addToast(
            "info",
            "Swap broadcasted",
            `Swapping ${payAmount} PT for sBTC. Awaiting confirmation...`,
            data.txId,
          );

          const status = await waitForTransaction(data.txId);
          if (status === "success") {
            setTxState("success");
            addToast("success", "Swap confirmed!", "Your transaction was successful.", data.txId);
            refetch();
          } else {
            setTxState("error");
            addToast("error", "Swap failed", "Your transaction failed on-chain.", data.txId);
          }
        },
        () => {
          setTxState("idle");
          addToast("info", "Cancelled", "You cancelled the wallet signing.");
        },
      );
    }
  }

  function flipDirection() {
    setDirection((d) => (d === "sbtc-to-pt" ? "pt-to-sbtc" : "sbtc-to-pt"));
    setPayAmount("");
  }

  const payLabel = direction === "sbtc-to-pt" ? "sBTC" : "PT";
  const receiveLabel = direction === "sbtc-to-pt" ? "PT" : "sBTC";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
            PT Market
          </h1>
          <p className="text-slate-400">
            Trade Principal Tokens (PT) at a discount to secure fixed yield.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#0a0a0c] border border-[#1a1a24] px-4 py-2 rounded-lg text-sm">
            <span className="text-slate-500 mr-2">Implied APY:</span>
            <span className="text-emerald-400 font-mono">~4.85%</span>
          </div>
          <div className="bg-[#0a0a0c] border border-[#1a1a24] px-4 py-2 rounded-lg text-sm">
            <span className="text-slate-500 mr-2">1 PT =</span>
            <span className="text-white font-mono">0.985 sBTC</span>
          </div>
        </div>
      </div>

      {txState === "success" && txId && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
          <CheckCircle2 size={16} className="text-emerald-400 inline mr-2" />
          <span className="text-emerald-400 font-medium text-sm">
            Swap confirmed!{" "}
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

      {txState === "error" && txId && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center">
          <XCircle size={16} className="text-red-400 inline mr-2" />
          <span className="text-red-400 font-medium text-sm">
            Swap failed!{" "}
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Swap Interface */}
        <div className="lg:col-span-3 bg-[#0a0a0c] border border-[#1a1a24] rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-medium">Swap</h3>
            <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Settings2 size={18} />
            </button>
          </div>

          <div className="relative">
            {/* Pay */}
            <div className="bg-[#030303] border border-[#1a1a24] rounded-2xl p-4 mb-2 transition-colors focus-within:border-indigo-500/50">
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-400 text-xs font-medium pl-1">
                  You Pay
                </label>
                <span className="text-slate-500 text-xs pr-1">
                  Balance: {loading ? "..." : formatBalance(payBalance)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={payAmount}
                  onChange={(e) => {
                    if (/^[0-9]*\.?[0-9]*$/.test(e.target.value))
                      setPayAmount(e.target.value);
                  }}
                  placeholder="0.0"
                  className="bg-transparent border-none outline-none text-3xl text-white font-mono w-full placeholder:text-slate-700"
                />
                <button className="flex items-center gap-2 bg-[#111118] hover:bg-[#1a1a24] transition-colors py-2 px-3 rounded-xl border border-[#1a1a24] shrink-0 cursor-pointer">
                  <span
                    className={`font-medium text-sm ${direction === "sbtc-to-pt" ? "text-white" : "text-emerald-400 font-bold"}`}
                  >
                    {payLabel}
                  </span>
                </button>
              </div>
            </div>

            {/* Swap Middle Button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
              <button
                onClick={flipDirection}
                className="w-10 h-10 rounded-xl bg-[#111118] border-4 border-[#0a0a0c] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1a1a24] transition-all cursor-pointer shadow-sm"
              >
                <ArrowDownUp size={16} />
              </button>
            </div>

            {/* Receive */}
            <div className="bg-[#030303] border border-[#1a1a24] rounded-2xl p-4 mb-6 transition-colors focus-within:border-emerald-500/50">
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-400 text-xs font-medium pl-1">
                  You Receive
                </label>
                <span className="text-slate-500 text-xs pr-1">
                  Balance: {loading ? "..." : formatBalance(receiveBalance)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  readOnly
                  type="text"
                  placeholder="0.0"
                  value={receiveAmount}
                  className="bg-transparent border-none outline-none text-3xl text-emerald-400 font-mono w-full placeholder:text-slate-700 cursor-default"
                />
                <button className="flex items-center gap-2 bg-[#111118] hover:bg-[#1a1a24] transition-colors py-2 px-3 rounded-xl border border-[#1a1a24] shrink-0 cursor-pointer">
                  <span
                    className={`font-bold text-sm ${direction === "sbtc-to-pt" ? "text-emerald-400" : "text-white"}`}
                  >
                    {receiveLabel}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6 px-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Exchange Rate</span>
              <span className="text-slate-300 font-mono">
                1 {payLabel} = {exchangeRate} {receiveLabel}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Slippage Tolerance</span>
              <span className="text-slate-300 font-mono">0.5%</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleSwap}
            disabled={!isValidAmount || txState === "pending" || txState === "submitted"}
            className="w-full bg-white hover:bg-slate-200 text-black py-4 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {txState === "pending" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Waiting for wallet...
              </>
            ) : txState === "submitted" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Awaiting confirmation...
              </>
            ) : (
              `Swap ${payLabel} for ${receiveLabel}`
            )}
          </button>
        </div>

        {/* Market Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0a0a0c] border border-[#1a1a24] p-6 rounded-2xl">
            <h3 className="text-white font-medium mb-6 flex items-center gap-2">
              <BarChart size={16} className="text-indigo-400" /> Fixed Pool
              Analytics
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-slate-500 text-sm mb-1">Your sBTC Balance</p>
                <p className="text-white font-mono text-2xl">
                  {loading ? "—" : formatBalance(sbtcBalance)} sBTC
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Your PT Balance</p>
                <p className="text-white font-mono text-2xl">
                  {loading ? "—" : formatBalance(ptBalance)} PT
                </p>
              </div>
              <div className="pt-4 border-t border-[#1a1a24]">
                <p className="text-slate-400 text-xs italic">
                  Note: The AMM pool uses a specialized curve that accounts for
                  time-decay. PT price naturally drifts towards 1.0 sBTC as
                  maturity approaches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
