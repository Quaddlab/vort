"use client";

import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Wallet, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { connect } = useWallet();

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[#0A0A0A]/90 backdrop-blur-md border-b border-slate-800 py-3" : "bg-transparent py-5"}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded bg-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl tracking-tighter">
              V
            </span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Vort
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <ScrollLink
            to="about"
            smooth={true}
            duration={500}
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer"
          >
            About
          </ScrollLink>
          <ScrollLink
            to="how-it-works"
            smooth={true}
            duration={500}
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer"
          >
            How It Works
          </ScrollLink>
          <ScrollLink
            to="snapshot"
            smooth={true}
            duration={500}
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer"
          >
            Snapshot
          </ScrollLink>
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={connect}
            className="flex items-center gap-2 bg-slate-100 hover:bg-white text-black font-semibold py-2 px-5 rounded-md transition-all cursor-pointer"
          >
            <Wallet size={16} />
            <span>Connect Wallet</span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-300 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-vort-surface border-b border-slate-800 p-6 flex flex-col gap-6 shadow-2xl"
        >
          <ScrollLink
            to="about"
            smooth={true}
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 text-lg font-medium cursor-pointer"
          >
            About
          </ScrollLink>
          <ScrollLink
            to="how-it-works"
            smooth={true}
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 text-lg font-medium cursor-pointer"
          >
            How It Works
          </ScrollLink>
          <ScrollLink
            to="snapshot"
            smooth={true}
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 text-lg font-medium cursor-pointer"
          >
            Snapshot
          </ScrollLink>
          <button
            onClick={() => {
              connect();
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 px-5 rounded-md mt-2 w-full transition-all cursor-pointer"
          >
            <Wallet size={18} />
            <span>Connect Wallet</span>
          </button>
        </motion.div>
      )}
    </nav>
  );
}
