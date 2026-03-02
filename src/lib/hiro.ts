/**
 * Hiro API Service — Server-Only
 *
 * Wraps the Hiro Stacks REST API for two use cases:
 *  1. Fetching user-specific token balances (on-demand, never cached)
 *  2. Simulating read-only contract calls (for deposit/swap previews)
 *
 * Security:
 *  - Validates all wallet addresses before making external calls
 *  - Strips sensitive metadata from responses before returning
 *  - Never logs full RPC responses
 *  - Never stores user balances in the backend
 */

import { getServerEnv } from "./env";
import { validateStxAddress, safeLog } from "./security";
import { PUBLIC_CONFIG } from "./env";

// ============================================================
//  Types
// ============================================================

export interface TokenBalances {
  stx: number;
  sbtc: number;
  pt: number;
  yt: number;
}

interface HiroBalanceResponse {
  stx?: { balance?: string };
  fungible_tokens?: Record<string, { balance?: string }>;
}

// ============================================================
//  1. Fetch User Balances
// ============================================================

/**
 * Fetches PT, YT, sBTC, and STX balances for a given Stacks address.
 * Data is fetched directly from the Hiro API — never cached in the backend.
 *
 * @throws Error if the address is invalid or the Hiro API is unreachable.
 */
export async function getUserBalances(address: string): Promise<TokenBalances> {
  if (!validateStxAddress(address)) {
    throw new Error("Invalid Stacks address format");
  }

  const env = getServerEnv();
  const url = `${env.hiroApiUrl}/extended/v1/address/${address}/balances`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store", // always fresh — user balances should never be stale
  });

  if (!response.ok) {
    safeLog("error", "Hiro API balance fetch failed", {
      status: response.status,
      address: `${address.slice(0, 6)}...${address.slice(-4)}`, // truncated for safety
    });
    throw new Error(`Hiro API returned ${response.status}`);
  }

  const data: HiroBalanceResponse = await response.json();

  // Extract token balances from the fungible_tokens map
  const deployer = PUBLIC_CONFIG.contractDeployer;
  const ptKey = `${deployer}.pt-token::principal-token`;
  const ytKey = `${deployer}.yt-token::yield-token`;
  const sbtcKey = `${deployer}.sbtc-token::sbtc`;

  return {
    stx: parseBalance(data.stx?.balance),
    sbtc: parseBalance(data.fungible_tokens?.[sbtcKey]?.balance),
    pt: parseBalance(data.fungible_tokens?.[ptKey]?.balance),
    yt: parseBalance(data.fungible_tokens?.[ytKey]?.balance),
  };
}

// ============================================================
//  2. Read-Only Contract Calls (Previews)
// ============================================================

/**
 * Calls a read-only function on a Stacks smart contract via the Hiro API.
 * Used for previewing deposits and swaps — simulates exactly how the
 * smart contract will evaluate the call.
 *
 * @param contractName  – e.g. "tokenizer" or "pt-amm"
 * @param functionName  – e.g. "get-pt-price" or "simulate-mint"
 * @param args          – Clarity-encoded arguments
 * @param senderAddress – The address simulating the call
 */
export async function callReadOnly(
  contractName: string,
  functionName: string,
  args: string[],
  senderAddress: string,
): Promise<unknown> {
  if (!validateStxAddress(senderAddress)) {
    throw new Error("Invalid sender address format");
  }

  const env = getServerEnv();
  const deployer = PUBLIC_CONFIG.contractDeployer;
  const url = `${env.hiroApiUrl}/v2/contracts/call-read-only/${deployer}/${contractName}/${functionName}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: senderAddress,
      arguments: args,
    }),
  });

  if (!response.ok) {
    safeLog("error", "Read-only contract call failed", {
      contract: contractName,
      function: functionName,
      status: response.status,
    });
    throw new Error(`Contract call failed with ${response.status}`);
  }

  const result = await response.json();

  // Only return the result value, strip any internal metadata
  return {
    okay: result.okay,
    result: result.result,
  };
}

// ============================================================
//  Helpers
// ============================================================

function parseBalance(raw: string | undefined): number {
  if (!raw) return 0;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * Finds the sBTC token key in the fungible_tokens map.
 * The key format varies by network, so we search for it by name.
 */
function findSbtcKey(tokens: Record<string, unknown>): string {
  for (const key of Object.keys(tokens)) {
    if (key.toLowerCase().includes("sbtc")) return key;
  }
  return ""; // not found
}
