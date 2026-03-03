"use client";

import { useEffect, useState } from "react";

interface ZestApyData {
  supplyApyPercent: number;
  borrowApyPercent: number;
  utilizationPercent: number;
  totalSbtcDeposited: number;
  source: "zest-v2-mainnet" | "fallback";
}

const DEFAULT: ZestApyData = {
  supplyApyPercent: 5.42,
  borrowApyPercent: 8.1,
  utilizationPercent: 66.9,
  totalSbtcDeposited: 0,
  source: "fallback",
};

export function useZestApy() {
  const [data, setData] = useState<ZestApyData>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchApy() {
      try {
        const res = await fetch("/api/zest-apy", { cache: "no-store" });
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        if (!cancelled) {
          setData({
            supplyApyPercent: json.supplyApyPercent,
            borrowApyPercent: json.borrowApyPercent,
            utilizationPercent: json.utilizationPercent,
            totalSbtcDeposited: json.totalSbtcDeposited,
            source: json.source,
          });
        }
      } catch {
        // Keep defaults on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchApy();

    // Refresh every 5 minutes
    const interval = setInterval(fetchApy, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { ...data, loading };
}
