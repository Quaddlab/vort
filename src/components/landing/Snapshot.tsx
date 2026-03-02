"use client";

import { motion } from "framer-motion";
import { Clock, Layers, TrendingUp, Zap } from "lucide-react";

export function Snapshot() {
  return (
    <section
      id="snapshot"
      className="py-32 bg-[#030303] relative overflow-hidden"
    >
      {/* Immersive Dark Gradient Backgrounds */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-900/20 rounded-full blur-[140px] mix-blend-screen pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none -translate-x-1/3 translate-y-1/4" />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />

      {/* Cybernetic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_70%_70%_at_50%_40%,#000_20%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-semibold text-white mb-4 tracking-tighter"
            >
              Live State <span className="text-slate-600">Snapshot</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg font-light md:w-1/3 md:text-right"
          >
            Real-time telemetry tracking the high-performance fixed-income layer
            on Stacks.
          </motion.p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          {/* Card 1: Massive TVL Block (Spans 8 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 lg:p-12 relative overflow-hidden group shadow-2xl"
          >
            {/* Ambient Inner Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[80px] -mr-40 -mt-40 transition-all opacity-50 group-hover:opacity-100 group-hover:bg-indigo-500/20" />

            {/* Tech Decoration Lines */}
            <div className="absolute bottom-0 right-12 w-px h-32 bg-linear-to-t from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute bottom-12 right-0 w-32 h-px bg-linear-to-l from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex flex-col h-full justify-between relative z-10">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Layers size={20} className="text-indigo-400" />
                    <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
                      Total Value Locked
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-mono bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <TrendingUp size={14} />
                    +12.4% (7d)
                  </div>
                </div>

                {/* Abstract Data Viz Decoration */}
                <div className="hidden md:flex gap-1 h-12 items-end opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-2 bg-indigo-500/40 h-[40%] rounded-t-sm" />
                  <div className="w-2 bg-indigo-500/40 h-[60%] rounded-t-sm" />
                  <div className="w-2 bg-indigo-500/60 h-[30%] rounded-t-sm" />
                  <div className="w-2 bg-indigo-500/80 h-[80%] rounded-t-sm" />
                  <div className="w-2 bg-emerald-400 h-[100%] rounded-t-sm shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                </div>
              </div>

              <div>
                <div className="flex items-end gap-4 mb-2">
                  <h3 className="text-6xl sm:text-7xl lg:text-[7rem] leading-none font-medium text-white font-mono tracking-tighter mix-blend-plus-lighter">
                    425.8
                  </h3>
                  <span className="text-3xl sm:text-4xl lg:text-5xl text-indigo-400/50 font-sans pb-2 lg:pb-4 font-light">
                    sBTC
                  </span>
                </div>
                <p className="text-slate-500/80 font-mono text-xs sm:text-sm">
                  ~$28,405,210.00 USD{" "}
                  <span className="text-slate-700 mx-2">|</span> Verified
                  on-chain
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column Stack (Spans 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Card 2: Yield */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-linear-to-br from-[#111516] to-[#0a0d0e] border border-emerald-500/20 p-8 rounded-3xl flex-1 relative overflow-hidden group shadow-[0_0_40px_-15px_rgba(16,185,129,0.2)]"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-500" />

              <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-xs text-emerald-500">
                SRC: pt-amm.clar
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/20 transition-colors shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]">
                    <Zap
                      size={20}
                      className="drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                  <p className="text-emerald-400/80 font-mono text-xs uppercase tracking-widest mb-1">
                    Implied Fixed Yield
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <h3 className="text-5xl lg:text-6xl font-medium text-white tracking-tighter mix-blend-plus-lighter">
                    4.85
                  </h3>
                  <span className="text-2xl text-emerald-400 font-sans font-medium mix-blend-plus-lighter">
                    %
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Epoch Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-[#0a0a0c] border border-white/5 p-8 rounded-3xl flex-1 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-slate-500/20 transition-colors" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center text-slate-300">
                    <Clock size={18} />
                  </div>
                  <span className="px-2.5 py-1 bg-white/5 text-slate-400 text-[10px] font-mono rounded-md uppercase tracking-wider border border-white/5">
                    Flagship Epoch
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <h3 className="text-4xl lg:text-5xl font-medium text-white tracking-tighter">
                      120
                    </h3>
                    <span className="text-lg text-slate-500 font-sans">
                      Days
                    </span>
                  </div>

                  {/* Cyber Bar */}
                  <div className="space-y-3">
                    <div className="w-full bg-[#111] rounded-sm h-1.5 overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "66%" }}
                        transition={{
                          duration: 1.5,
                          delay: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="bg-slate-200 h-full relative"
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-r from-transparent to-white blur-[2px]" />
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-slate-500">
                      <span>Day 80</span>
                      <span className="text-slate-300">Maturity: Day 120</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
