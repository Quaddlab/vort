"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  Coins,
  Blocks,
  Check,
  Banknote,
  LineChart,
  ShieldCheck,
} from "lucide-react";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-32 bg-vort-base relative overflow-hidden"
    >
      {/* Subtle top border and radial gradient for lighting */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-indigo-500/10 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20 md:mb-32"
        >
          <h2 className="text-3xl md:text-5xl font-medium text-white mb-6 tracking-tight">
            How Vort Works
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed font-light">
            A precise, structurally sound mechanism to split Bitcoin into
            predictable fixed-income and dynamic floating-yield assets.
          </p>
        </motion.div>

        {/* Institutional Timeline Flow */}
        <div className="relative max-w-5xl mx-auto">
          {/* Timeline central line */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-24 w-px bg-slate-800 -translate-x-1/2">
            <motion.div
              className="w-full bg-indigo-500/40"
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="space-y-24 md:space-y-32">
            {/* Step 1: Deposit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col md:flex-row items-start md:items-center justify-between group"
            >
              <div className="md:w-5/12 text-left md:pr-16 order-2 md:order-1 mt-8 md:mt-0 ml-16 md:ml-0">
                <div className="text-indigo-400/50 font-mono text-sm mb-3 group-hover:text-indigo-400 transition-colors">
                  01
                </div>
                <h3 className="text-slate-100 text-2xl font-medium mb-4 tracking-tight group-hover:text-indigo-100 transition-colors">
                  Deposit sBTC
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Provide sBTC to the Tokenizer smart contract. Your Bitcoin is
                  immediately and natively deployed to the underlying yield
                  strategy to begin generating real on-chain yield.
                </p>
              </div>

              {/* Center Node */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-vort-base border-[1.5px] border-indigo-500/30 rounded-full z-10 flex items-center justify-center transition-colors group-hover:border-indigo-400/60">
                <div className="w-1 h-1 bg-indigo-400/80 rounded-full" />
              </div>

              <div className="md:w-5/12 md:pl-16 ml-16 md:ml-0 order-1 md:order-3 w-[calc(100%-4rem)]">
                <div className="bg-vort-surface/80 backdrop-blur-sm border border-slate-800/60 p-6 rounded-lg hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-indigo-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-md bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Coins size={18} className="text-amber-400" />
                    </div>
                    <span className="text-[10px] font-mono text-amber-500 border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded-sm">
                      INIT_DEPOSIT
                    </span>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs font-mono mb-1 uppercase tracking-wider">
                      Input Asset
                    </div>
                    <div className="text-slate-100 font-medium text-lg">
                      1.00 sBTC
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2: Protocol Engine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative flex flex-col md:flex-row items-start justify-between group"
            >
              <div className="md:w-5/12 md:pr-16 hidden md:block order-1 relative pt-8">
                {/* Connection line from main timeline */}
                <div className="absolute right-0 top-14 w-16 h-px bg-slate-800 group-hover:bg-indigo-500/20 transition-colors" />

                <div className="bg-vort-surface/80 backdrop-blur-sm border border-slate-800/60 rounded-lg p-6 hover:border-slate-700 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/60">
                    <Blocks
                      size={16}
                      className="text-slate-400 group-hover:text-indigo-400 transition-colors"
                    />
                    <span className="text-slate-300 font-medium text-sm tracking-wide group-hover:text-slate-200 transition-colors">
                      Underlying Architecture
                    </span>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between text-sm group/item">
                      <span className="text-slate-400 font-light group-hover/item:text-slate-300 transition-colors">
                        Tokenizer Mint
                      </span>
                      <ShieldCheck
                        size={14}
                        className="text-emerald-500/50 group-hover/item:text-emerald-400 transition-colors"
                      />
                    </li>
                    <li className="flex items-center justify-between text-sm group/item">
                      <span className="text-slate-400 font-light group-hover/item:text-slate-300 transition-colors">
                        Yield-Router Accounting
                      </span>
                      <ShieldCheck
                        size={14}
                        className="text-emerald-500/50 group-hover/item:text-emerald-400 transition-colors"
                      />
                    </li>
                    <li className="flex items-center justify-between text-sm group/item">
                      <span className="text-slate-400 font-light group-hover/item:text-slate-300 transition-colors">
                        Post-Condition Security
                      </span>
                      <ShieldCheck
                        size={14}
                        className="text-emerald-500/50 group-hover/item:text-emerald-400 transition-colors"
                      />
                    </li>
                  </ul>
                </div>
              </div>

              {/* Center Node */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-vort-base border-[1.5px] border-indigo-500/30 rounded-full z-10 top-14 flex items-center justify-center transition-colors group-hover:border-indigo-400/60">
                <div className="w-1 h-1 bg-indigo-400/80 rounded-full" />
              </div>

              <div className="md:w-5/12 text-left md:pl-16 ml-16 md:ml-0 order-2 md:order-3 w-[calc(100%-4rem)] mt-8 md:mt-0 lg:pt-8">
                <div className="text-indigo-400/50 font-mono text-sm mb-3 group-hover:text-indigo-400 transition-colors">
                  02
                </div>
                <h3 className="text-slate-100 text-2xl font-medium mb-4 tracking-tight group-hover:text-indigo-100 transition-colors">
                  Split Principal & Yield
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  The protocol programmatically mints exactly 1 PT (Principal
                  Token) and 1 YT (Yield Token) for every 1 sBTC deposited,
                  cleanly stripping the yield from the principal asset over the
                  fixed epoch duration.
                </p>

                {/* Mobile version of the architecture box */}
                <div className="md:hidden mt-8 bg-vort-surface/80 backdrop-blur-sm border border-slate-800/60 p-5 rounded-lg">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800/60">
                    <Blocks size={16} className="text-slate-400" />
                    <span className="text-slate-200 font-medium text-sm">
                      Underlying Architecture
                    </span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-light">
                        Tokenizer Mint
                      </span>
                      <Check size={14} className="text-emerald-500/70" />
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-light">
                        Yield-Router Acct.
                      </span>
                      <Check size={14} className="text-emerald-500/70" />
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Step 3: Output Tokens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative flex flex-col items-center justify-between pt-16 md:pt-24 group"
            >
              <div className="hidden md:block absolute left-[25%] right-[25%] top-0 h-px bg-slate-800 -z-10 transition-colors group-hover:bg-indigo-500/10" />
              <div className="hidden md:block absolute left-[25%] top-0 h-8 w-px bg-slate-800 -z-10 transition-colors group-hover:bg-emerald-500/20" />
              <div className="hidden md:block absolute right-[25%] top-0 h-8 w-px bg-slate-800 -z-10 transition-colors group-hover:bg-indigo-500/20" />

              {/* Center Final Node */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 -top-2 w-4 h-4 bg-vort-base border-[1.5px] border-slate-700 rounded-full z-10 flex items-center justify-center transition-colors group-hover:border-indigo-400/40 group-hover:bg-indigo-500/5">
                <ArrowDown
                  size={10}
                  className="text-slate-500 transition-colors group-hover:text-indigo-400"
                />
              </div>

              <div className="w-full pl-16 md:pl-0 mt-8 grid md:grid-cols-2 gap-6 md:gap-12 relative">
                {/* Decorative branching line for mobile */}
                <div className="md:hidden absolute left-6 -top-24 bottom-[60%] w-px bg-slate-800" />
                <div
                  className="md:hidden absolute left-6 border-l border-b border-slate-800 w-4 h-4 rounded-bl-lg mt-12"
                  style={{ top: "60%" }}
                />

                {/* PT Output */}
                <div className="bg-vort-surface/80 backdrop-blur-sm border border-slate-800/60 p-8 rounded-lg hover:border-emerald-500/30 transition-all duration-300 group/pt relative overflow-hidden shadow-sm hover:shadow-emerald-500/5">
                  <div className="absolute top-0 inset-x-0 h-px bg-slate-800/80 group-hover/pt:bg-emerald-500/40 transition-colors duration-500" />

                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                          <Banknote size={16} className="text-emerald-400" />
                        </div>
                        <h4 className="text-slate-200 font-medium text-lg group-hover/pt:text-emerald-100 transition-colors">
                          Principal Token
                        </h4>
                      </div>
                      <div className="text-white text-3xl font-light font-mono tracking-tight">
                        1.00{" "}
                        <span className="text-slate-500 text-xl font-sans group-hover/pt:text-emerald-400/70 transition-colors">
                          PT
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-sm bg-emerald-500/5 text-emerald-400/80 text-[10px] font-mono border border-emerald-500/20 uppercase tracking-widest">
                      Fixed
                    </span>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-800/60 group-hover/pt:border-emerald-500/10 transition-colors">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-light">
                        Maturity Value
                      </span>
                      <span className="text-slate-300 font-mono">
                        1.00000 sBTC
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-light">
                        Duration Target
                      </span>
                      <span className="text-slate-300 font-mono">
                        Epoch End
                      </span>
                    </div>
                  </div>
                </div>

                {/* YT Output */}
                <div className="bg-vort-surface/80 backdrop-blur-sm border border-slate-800/60 p-8 rounded-lg hover:border-indigo-500/30 transition-all duration-300 group/yt relative overflow-hidden shadow-sm hover:shadow-indigo-500/5">
                  <div className="absolute top-0 inset-x-0 h-px bg-slate-800/80 group-hover/yt:bg-indigo-500/40 transition-colors duration-500" />

                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                          <LineChart size={16} className="text-indigo-400" />
                        </div>
                        <h4 className="text-slate-200 font-medium text-lg group-hover/yt:text-indigo-100 transition-colors">
                          Yield Token
                        </h4>
                      </div>
                      <div className="text-white text-3xl font-light font-mono tracking-tight">
                        1.00{" "}
                        <span className="text-slate-500 text-xl font-sans group-hover/yt:text-indigo-400/70 transition-colors">
                          YT
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-sm bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/30 uppercase tracking-widest">
                      Floating
                    </span>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-800/60 group-hover/yt:border-indigo-500/10 transition-colors">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-light">
                        Yield Oracle
                      </span>
                      <span className="text-slate-300 font-mono">
                        Zest Protocol
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-light">
                        Asset Profile
                      </span>
                      <span className="text-slate-300 font-mono">Long Vol</span>
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
