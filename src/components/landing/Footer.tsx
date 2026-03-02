"use client";

import { Link as ScrollLink } from "react-scroll";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-tighter">
                  V
                </span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Vort
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
              Vort is the institutional-grade fixed-income infrastructure layer
              built on the Stacks blockchain, unlocking predictable Bitcoin
              yields.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-vort-surface border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-vort-surface border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Protocol</h4>
            <ul className="space-y-4">
              <li>
                <ScrollLink
                  to="about"
                  smooth={true}
                  className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer"
                >
                  About Vort
                </ScrollLink>
              </li>
              <li>
                <ScrollLink
                  to="how-it-works"
                  smooth={true}
                  className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer"
                >
                  How It Works
                </ScrollLink>
              </li>
              <li>
                <ScrollLink
                  to="snapshot"
                  smooth={true}
                  className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer"
                >
                  Protocol Snapshot
                </ScrollLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Developers</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  GitHub Respository
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Smart Contracts (Explorer)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Zest Protocol Integation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-900 text-sm text-slate-600">
          <p>
            © {new Date().getFullYear()} SplitBTC / Vort Protocol. All rights
            reserved.
          </p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Built on Stacks</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
