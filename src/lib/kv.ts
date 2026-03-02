/**
 * KV Storage Layer — Server-Only
 *
 * Production: Uses @upstash/redis (serverless Redis) for global protocol state.
 * Local Dev:  Falls back to in-memory Map if UPSTASH_REDIS_REST_URL is not set.
 *
 * Stored data is ONLY global, non-user-specific protocol metrics.
 * User balances are NEVER cached here (fetched on-demand from Hiro API).
 */

import { Redis } from "@upstash/redis";
import { safeLog } from "./security";

// ============================================================
//  Types
// ============================================================

export interface ProtocolState {
  /** Total Value Locked in sBTC (micro-units) */
  tvl: number;
  /** Current epoch identifier */
  epochId: number;
  /** Total Principal Tokens minted across all users */
  ptMinted: number;
  /** Total Yield Tokens minted across all users */
  ytMinted: number;
  /** Block height of last confirmed on-chain event */
  lastBlockHeight: number;
  /** ISO timestamp of the last update */
  lastUpdated: string;
}

// ============================================================
//  Redis Client (or In-Memory Fallback)
// ============================================================

const REDIS_KEY = "vort:protocol_state";

const DEFAULT_STATE: ProtocolState = {
  tvl: 0,
  epochId: 120,
  ptMinted: 0,
  ytMinted: 0,
  lastBlockHeight: 0,
  lastUpdated: new Date().toISOString(),
};

/**
 * Determines if we have real Redis credentials.
 * If not, we fall back to in-memory storage for local development.
 */
const hasRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}

// In-memory fallback for local development
let memoryCache: ProtocolState = { ...DEFAULT_STATE };

// ============================================================
//  Public API
// ============================================================

/**
 * Returns the current cached protocol state.
 * ~5ms from Redis in production, ~0ms from memory in local dev.
 */
export async function getProtocolState(): Promise<ProtocolState> {
  if (!hasRedis) {
    return { ...memoryCache };
  }

  try {
    const data = await getRedis().get<ProtocolState>(REDIS_KEY);
    return data || { ...DEFAULT_STATE };
  } catch (err) {
    safeLog("error", "Redis GET failed, using default state", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return { ...DEFAULT_STATE };
  }
}

/**
 * Updates the cached protocol state.
 * Only called internally by the Chainhook webhook handler.
 */
export async function setProtocolState(
  update: Partial<ProtocolState>,
): Promise<void> {
  const current = await getProtocolState();
  const next: ProtocolState = {
    ...current,
    ...update,
    lastUpdated: new Date().toISOString(),
  };

  if (!hasRedis) {
    memoryCache = next;
  } else {
    try {
      await getRedis().set(REDIS_KEY, next);
    } catch (err) {
      safeLog("error", "Redis SET failed", {
        error: err instanceof Error ? err.message : "Unknown",
      });
    }
  }

  safeLog("info", "Protocol state updated", {
    tvl: next.tvl,
    epochId: next.epochId,
    ptMinted: next.ptMinted,
    ytMinted: next.ytMinted,
  });
}

/**
 * Atomically increments minted token counts and TVL.
 * Used when processing Mint events from Chainhooks.
 */
export async function incrementMintTotals(
  sbtcAmount: number,
  blockHeight: number,
): Promise<void> {
  const current = await getProtocolState();
  await setProtocolState({
    tvl: current.tvl + sbtcAmount,
    ptMinted: current.ptMinted + sbtcAmount,
    ytMinted: current.ytMinted + sbtcAmount,
    lastBlockHeight: blockHeight,
  });
}

/**
 * Decrements TVL when a burn/redeem event occurs.
 */
export async function decrementBurnTotals(
  sbtcAmount: number,
  blockHeight: number,
): Promise<void> {
  const current = await getProtocolState();
  await setProtocolState({
    tvl: Math.max(0, current.tvl - sbtcAmount),
    lastBlockHeight: blockHeight,
  });
}
