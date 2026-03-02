"use client";

import {
  ArrowRight,
  Coins,
  Info,
  ShieldCheck,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { useBalances } from "@/hooks/useBalances";
import {
  depositSbtc,
  formatBalance,
  toMicroUnits,
  mintTestSbtc,
} from "@/lib/stacks";

type TxState = "idle" | "pending" | "success" | "error";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txId, setTxId] = useState<string | null>(null);

  const { address } = useWallet();
  const { addToast } = useToast();
  const { balances, loading, refetch } = useBalances(address);

  const sbtcBalance = balances?.sbtc ?? 0;
  const parsedAmount = Number(amount) || 0;
  const microAmount = toMicroUnits(amount);
  const isValidAmount = parsedAmount > 0 && microAmount <= sbtcBalance;

  function handleDeposit() {
    if (!isValidAmount) return;
    setTxState("pending");

    depositSbtc(
      amount,
      (data) => {
        setTxId(data.txId);
        setTxState("success");
        setAmount("");
        addToast(
          "success",
          "Deposit submitted!",
          `${amount} sBTC deposited. You will receive ${amount} PT + ${amount} YT once confirmed.`,
          data.txId,
        );
        setTimeout(() => refetch(), 5000);
      },
      () => {
        setTxState("idle");
        addToast(
          "info",
          "Transaction cancelled",
          "You cancelled the wallet signing.",
        );
      },
    );
  }

  function handleMintTestSbtc() {
    if (!address) return;
    setTxState("pending");

    mintTestSbtc(
      "1",
      address,
      (data) => {
        setTxId(data.txId);
        setTxState("success");
        addToast(
          "success",
          "sBTC Minted!",
          "1 test sBTC has been minted to your wallet. Wait ~30 seconds for it to confirm, then you can deposit it.",
          data.txId,
        );
        setTimeout(() => refetch(), 5000);
      },
      () => {
        setTxState("idle");
        addToast("info", "Mint cancelled", "You cancelled the wallet signing.");
      },
    );
  }

  function handleMax() {
    if (sbtcBalance > 0) {
      setAmount((sbtcBalance / 1e8).toString());
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
            Mint PT &amp; YT
          </h1>
          <p className="text-slate-400 max-w-lg">
            Deposit your sBTC into the active epoch. You will receive an equal
            amount of Principal Tokens (PT) and Yield Tokens (YT).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0a0a0c] border border-emerald-500/20 px-4 py-2 rounded-lg text-emerald-400 text-sm font-medium">
          Epoch 120 Active
        </div>
      </div>

      {/* Mint test sBTC banner if balance is 0 */}
      {!loading && sbtcBalance === 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-400 font-medium text-sm mb-1">
              No sBTC Balance
            </p>
            <p className="text-slate-400 text-sm">
              You need test sBTC to make a deposit. Mint some to your wallet to
              get started.
            </p>
          </div>
          <button
            onClick={handleMintTestSbtc}
            disabled={txState === "pending"}
            className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {txState === "pending" ? "Minting..." : "Mint 1 Test sBTC"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Deposit Setup */}
        <div className="bg-[#0a0a0c] border border-[#1a1a24] rounded-3xl p-6 md:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px] -mr-20 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />

          <h3 className="text-white font-medium mb-6 relative z-10 flex items-center gap-2">
            1. Configure Deposit{" "}
            <ShieldCheck size={16} className="text-emerald-400" />
          </h3>

          <div className="relative z-10">
            {/* Input Card */}
            <div className="bg-[#030303] border border-[#1a1a24] rounded-2xl p-5 mb-8 transition-colors focus-within:border-indigo-500/50">
              <div className="flex justify-between items-center mb-4">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider pl-1">
                  Amount to deposit
                </label>
                <div className="flex gap-2 items-center">
                  <span className="text-slate-500 text-xs">
                    Balance: {loading ? "..." : formatBalance(sbtcBalance)} sBTC
                  </span>
                  <button
                    onClick={handleMax}
                    className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[0-9]*\.?[0-9]*$/.test(val)) setAmount(val);
                  }}
                  placeholder="0.00"
                  className="bg-transparent border-none outline-none text-4xl md:text-5xl text-white font-mono w-full placeholder:text-slate-800"
                />
                <div className="flex items-center gap-2 bg-[#111118] py-2.5 px-4 rounded-xl border border-[#1a1a24] shrink-0">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Coins size={14} className="text-amber-500" />
                  </div>
                  <span className="text-white font-semibold">sBTC</span>
                </div>
              </div>
            </div>

            {/* Mint Info List */}
            <div className="space-y-4 mb-10 p-4 rounded-2xl bg-[#111118]/50 border border-[#1a1a24]">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-1">
                  <Info size={14} /> You Receive
                </span>
                <span className="text-slate-200">
                  {parsedAmount || "0"} PT + {parsedAmount || "0"} YT
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span
                  className="text-slate-400"
                  title="Estimated — will be derived from AMM pool price once liquidity is seeded"
                >
                  Est. Fixed APY (PT)
                </span>
                <span className="text-emerald-400 font-mono font-medium">
                  ~5.42%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Network Fee</span>
                <span className="text-slate-300 font-mono">~0.001 STX</span>
              </div>
            </div>

            {/* CTA */}
            {txState === "success" ? (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/30 py-4 rounded-xl text-center">
                <CheckCircle2
                  size={20}
                  className="text-emerald-400 inline mr-2"
                />
                <span className="text-emerald-400 font-medium">
                  Transaction submitted!
                </span>
                {txId && (
                  <a
                    href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-indigo-400 text-sm mt-2 hover:underline cursor-pointer"
                  >
                    View on Explorer →
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={!isValidAmount || txState === "pending"}
                className="w-full bg-white hover:bg-slate-200 text-black py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 group"
              >
                {txState === "pending" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Waiting for wallet...
                  </>
                ) : (
                  <>
                    Sign Transaction
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform opacity-50 group-hover:opacity-100"
                    />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Preview Output */}
        <div className="bg-[#0a0a0c] border border-[#1a1a24] rounded-3xl p-6 md:p-8 relative overflow-hidden group flex flex-col">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-50 transition-opacity duration-700" />

          <h3 className="text-white font-medium mb-6 relative z-10 flex items-center gap-2">
            2. Receive Position{" "}
            <Zap size={16} className="text-amber-400 fill-amber-400/20" />
          </h3>

          <div className="relative z-10 flex-1 flex flex-col justify-center gap-2 sm:gap-6 pt-4 pb-8">
            {/* The Input Representation */}
            <div className="flex justify-center mb-2">
              <div className="px-6 py-3 rounded-full bg-[#111118] border border-[#1a1a24] text-slate-400 font-mono text-lg transition-colors group-hover:bg-[#1a1a24]">
                {amount || "0.00"} sBTC
              </div>
            </div>

            {/* Split Flow Arrows */}
            <div className="flex justify-center items-center gap-16 md:gap-24 opacity-50 relative">
              <div className="absolute left-1/2 top-1/2 w-48 h-px bg-[#1a1a24] -translate-x-1/2 -z-10" />
              <div className="w-px h-8 bg-linear-to-b from-[#1a1a24] to-emerald-500/50" />
              <div className="w-px h-8 bg-linear-to-b from-[#1a1a24] to-indigo-500/50" />
            </div>

            {/* Output Tokens */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-6">
              {/* PT Output */}
              <div className="flex-1 bg-linear-to-b from-[#111118] to-[#0a0a0c] border border-emerald-500/20 p-5 rounded-2xl flex flex-col items-center text-center transition-all hover:border-emerald-500/40">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <span className="text-emerald-400 font-bold">PT</span>
                </div>
                <p className="text-slate-300 font-medium mb-1">
                  Principal Token
                </p>
                <p className="text-2xl font-mono text-white tracking-tight mb-2">
                  {amount || "0.00"}
                </p>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[150px]">
                  Redeemable for exactly 1 sBTC at maturity date.
                </p>
              </div>

              {/* YT Output */}
              <div className="flex-1 bg-linear-to-b from-[#111118] to-[#0a0a0c] border border-indigo-500/20 p-5 rounded-2xl flex flex-col items-center text-center transition-all hover:border-indigo-500/40">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <span className="text-indigo-400 font-bold">YT</span>
                </div>
                <p className="text-slate-300 font-medium mb-1">Yield Token</p>
                <p className="text-2xl font-mono text-white tracking-tight mb-2">
                  {amount || "0.00"}
                </p>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[150px]">
                  Collects the floating protocol yield for the epoch duration.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 p-4 rounded-xl bg-[#111118]/50 border border-[#1a1a24] text-center">
            <p className="text-slate-400 text-sm">
              You can sell your PT on the Market right away to lock in your
              fixed APY upfront.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
