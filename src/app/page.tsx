import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Snapshot } from "@/components/landing/Snapshot";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-vort-base text-slate-200">
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <Snapshot />
      <Footer />
    </main>
  );
}
