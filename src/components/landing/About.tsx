"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-24 bg-vort-base">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6 leading-tight">
              A professional fixed-income market for{" "}
              <span className="text-violet-400">Bitcoin.</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Vort separates the principal and the yield of sBTC into two
              distinct, tradable assets. This empowers users to lock in
              predictable, fixed returns on their Bitcoin, or leverage their
              position to maximize yield exposure in volatile markets.
            </p>

            <ul className="space-y-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Principal Protection",
                  desc: "PT tokens guarantee 1:1 redemption of your initial sBTC deposit at epoch maturity.",
                },
                {
                  icon: Zap,
                  title: "Capital Efficiency",
                  desc: "Sell your Yield Tokens (YT) upfront to access immediate liquidity based on future expected yield.",
                },
                {
                  icon: CheckCircle2,
                  title: "Bank-Grade Smart Contracts",
                  desc: "Built with Clarity on Stacks. Non-Turing complete design prevents reentrancy hacks natively.",
                },
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1 shrink-0 w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-500">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-lg mb-1">
                      {item.title}
                    </h4>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-vort-surface border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck size={200} />
            </div>

            <h3 className="text-2xl font-semibold text-white mb-6 relative z-10">
              Institutional Architecture
            </h3>

            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-black border border-slate-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm">
                    Underlying Yield Source
                  </span>
                  <span className="text-emerald-500 text-sm font-medium">
                    Active
                  </span>
                </div>
                <p className="text-white font-medium">
                  Zest Protocol sBTC Lending
                </p>
              </div>

              <div className="p-4 bg-black border border-slate-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm">
                    Automated Market Maker
                  </span>
                  <span className="text-violet-400 text-sm font-medium">
                    V1 Engine
                  </span>
                </div>
                <p className="text-white font-medium">
                  Time-Decaying PT Invariant
                </p>
              </div>

              <div className="p-4 bg-black border border-slate-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm">Security Layer</span>
                  <span className="text-emerald-500 text-sm font-medium">
                    Verified
                  </span>
                </div>
                <p className="text-white font-medium">Stacks Post-Conditions</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
