/**
 * Environment variable validation.
 * This module is SERVER-ONLY. It must never be imported from a client component.
 *
 * Security: All env vars are accessed via process.env and never exposed to the
 * client bundle. NEXT_PUBLIC_ prefixed vars are the only exception (safe public config).
 */

// --- Public Config (safe to expose) ---
export const PUBLIC_CONFIG = {
  network: process.env.NEXT_PUBLIC_NETWORK || "testnet",
  contractDeployer:
    process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER ||
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  tokenizerContract: process.env.NEXT_PUBLIC_TOKENIZER_CONTRACT || "tokenizer-v2",
  ptAmmContract: process.env.NEXT_PUBLIC_PT_AMM_CONTRACT || "pt-amm",
} as const;

// --- Server-Only Secrets ---
function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(
      `[ENV] Missing required environment variable: ${key}. ` +
        `See .env.example for the full list.`,
    );
  }
  return value;
}

/**
 * Returns validated server-side environment configuration.
 * Call this lazily inside API route handlers, NOT at module top-level,
 * so that build-time static generation doesn't fail.
 */
export function getServerEnv() {
  return {
    hiroApiUrl: requireEnv("HIRO_API_URL", "https://api.testnet.hiro.so"),
    chainhookAuthToken: requireEnv(
      "CHAINHOOK_AUTH_TOKEN",
      "dev-token-replace-me",
    ),
    // Note: Upstash Redis env vars (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
    // are read automatically by @upstash/redis via Redis.fromEnv()
  };
}
