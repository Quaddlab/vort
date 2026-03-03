"use client";

import { useEffect, useState } from "react";

export interface EpochData {
  epochId: number;
  startBlock: number;
  endBlock: number;
  totalDeposits: number;
  isMature: boolean;
  blocksRemaining: number;
  estimatedMaturityDate: string;
}

const DEFAULT: EpochData = {
  epochId: 120,
  startBlock: 0,
  endBlock: 0,
  totalDeposits: 0,
  isMature: false,
  blocksRemaining: 17280,
  estimatedMaturityDate: new Date(
    Date.now() + 17280 * 10 * 60 * 1000,
  ).toISOString(),
};

export function useEpoch() {
  const [data, setData] = useState<EpochData>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchEpoch() {
      try {
        const res = await fetch("/api/epoch", { cache: "no-store" });
        if (!res.ok) throw new Error("API error");
        const json = await res.json();

        if (!cancelled) {
          setData({
            epochId: json.epochId,
            startBlock: json.startBlock,
            endBlock: json.endBlock,
            totalDeposits: json.totalDeposits,
            isMature: json.isMature,
            blocksRemaining: json.blocksRemaining,
            estimatedMaturityDate: json.estimatedMaturityDate,
          });
        }
      } catch {
        // Keep defaults on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEpoch();
    const interval = setInterval(fetchEpoch, 60 * 1000); // refresh every 1 min
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { ...data, loading };
}
