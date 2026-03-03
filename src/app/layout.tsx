import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vort - Bitcoin Fixed-Income Infrastructure",
  description:
    "Vort transforms yield-bearing sBTC into tradable fixed-income primitives on the Stacks blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans bg-black text-slate-200 antialiased`}
      >
        <ToastProvider>
          <WalletProvider>{children}</WalletProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
