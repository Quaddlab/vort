"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { TokenBalances } from "@/lib/hiro";

export function useBalances(address: string | null) {
  const [balances, setBalances] = useState<TokenBalances | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setBalances(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/balances/${address}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setBalances(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 15_000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchBalances]);

  /**
   * Aggressive refetch: polls every 5 seconds for 2 minutes after a transaction.
   * This ensures the balance updates as soon as the TX confirms on testnet.
   */
  const refetch = useCallback(() => {
    // Immediately fetch once
    fetchBalances();

    // Clear any existing aggressive poll
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    // Poll every 5 seconds for 2 minutes
    let count = 0;
    pollTimerRef.current = setInterval(() => {
      count++;
      fetchBalances();
      if (count >= 24) {
        // 24 * 5s = 2 minutes
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }, 5000);
  }, [fetchBalances]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  return { balances, error, loading, refetch };
}
