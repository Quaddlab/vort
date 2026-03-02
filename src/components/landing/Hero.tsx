"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, LockKeyhole } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Hero() {
  const { isConnected, isLoading, connect } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, isLoading, router]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-vort-base">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Cybernetic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_70%_70%_at_50%_40%,#000_20%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <h1 className="text-5xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
            The Fixed Income <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-indigo-400">
              Layer for Bitcoin.
            </span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl">
            Vort transforms yield-bearing sBTC into tradable fixed-income
            primitives. Lock in guaranteed rates, or speculate on future yields
            on the most secure blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={connect}
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium py-4 px-8 rounded-lg transition-colors group cursor-pointer"
            >
              <span>Connect Wallet</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-medium py-4 px-8 rounded-lg transition-colors cursor-pointer">
              Read Documentation
            </button>
          </div>
        </motion.div>

        {/* Right Interface Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="absolute inset-0 bg-linear-to-tr from-violet-600/20 to-transparent blur-3xl rounded-full" />

          <div className="relative bg-vort-surface border border-slate-800 rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">
                  Current Variable Yield (Zest)
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-semibold text-white">5.42%</h3>
                  <span className="text-emerald-500 text-sm font-medium">
                    APY
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-violet-400">
                <BarChart3 size={24} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <LockKeyhole size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Lock Principal (PT)
                    </p>
                    <p className="text-slate-500 text-xs">
                      Maturity exactly 1 sBTC
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 font-medium">10,402 PT</p>
                </div>
              </div>

              <div className="bg-black/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Leverage Yield (YT)
                    </p>
                    <p className="text-slate-500 text-xs">
                      Floating return via Zest
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 font-medium">10,402 YT</p>
                </div>
              </div>
            </div>

            <button
              onClick={connect}
              className="w-full mt-8 bg-white hover:bg-slate-100 text-black font-semibold py-3 rounded-lg transition-colors cursor-pointer"
            >
              Deposit sBTC
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
