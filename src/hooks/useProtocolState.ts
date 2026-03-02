"use client";

import { useEffect, useState, useCallback } from "react";
import type { ProtocolState } from "@/lib/kv";

export function useProtocolState() {
  const [state, setState] = useState<ProtocolState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/protocol");
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 30_000);
    return () => clearInterval(interval);
  }, [fetchState]);

  return { state, error, loading, refetch: fetchState };
}
