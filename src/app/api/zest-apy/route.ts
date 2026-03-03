import { NextResponse } from "next/server";

/**
 * Fetches live sBTC vault data from Zest Protocol V2 on Stacks mainnet.
 *
 * Read-only calls to the Zest v0-vault-sbtc contract:
 *  - get-interest-rate  → current borrow rate in BPS
 *  - get-utilization    → pool utilization in BPS (0–10000)
 *  - get-total-assets   → total sBTC deposited (8 decimals)
 */

const ZEST_DEPLOYER = "SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7";
const ZEST_VAULT = "v0-vault-sbtc";
const HIRO_MAINNET = "https://api.hiro.so";

async function callReadOnly(functionName: string) {
  const url = `${HIRO_MAINNET}/v2/contracts/call-read/${ZEST_DEPLOYER}/${ZEST_VAULT}/${functionName}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: ZEST_DEPLOYER,
      arguments: [],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Zest API call failed: ${functionName} - ${res.status}`);
  }

  return res.json();
}

/**
 * Parse a Clarity `(ok uXXX)` hex result to extract the uint128 value.
 * Format: 0x07 (ok) + 01 (uint) + 32 hex chars (16 bytes big-endian uint128)
 */
function parseOkUint(hex: string): number {
  const raw = hex.startsWith("0x") ? hex.slice(2) : hex;
  // Skip "07" (ok) + "01" (uint tag) = 4 chars, remaining 32 chars is the uint128
  const uintHex = raw.slice(4);
  // Use parseInt for safe range (these values fit in standard JS numbers)
  return parseInt(uintHex, 16);
}

export async function GET() {
  try {
    const [irResult, utilResult, assetsResult] = await Promise.all([
      callReadOnly("get-interest-rate"),
      callReadOnly("get-utilization"),
      callReadOnly("get-total-assets"),
    ]);

    const borrowRateBps = parseOkUint(irResult.result);
    const utilizationBps = parseOkUint(utilResult.result);
    const totalAssetsRaw = parseOkUint(assetsResult.result);

    // Convert BPS values to percentages
    const borrowApyPercent = borrowRateBps / 100;
    const utilizationPercent = utilizationBps / 100;

    // Supply APY = borrow_rate × utilization / 10000
    // If utilization is 0 (no borrowers), supply APY is effectively 0.
    // In that case, we use the borrow rate as a reference for "potential yield".
    const supplyApyBps =
      utilizationBps > 0
        ? (borrowRateBps * utilizationBps) / 10000
        : borrowRateBps * 0.65; // Estimate at 65% utilization for display

    const supplyApyPercent = supplyApyBps / 100;

    // Total sBTC deposited (8 decimals)
    const totalSbtc = totalAssetsRaw / 1e8;

    return NextResponse.json({
      supplyApyPercent: Math.round(supplyApyPercent * 100) / 100,
      borrowApyPercent: Math.round(borrowApyPercent * 100) / 100,
      utilizationPercent: Math.round(utilizationPercent * 100) / 100,
      totalSbtcDeposited: Math.round(totalSbtc * 10000) / 10000,
      source: "zest-v2-mainnet",
      contract: `${ZEST_DEPLOYER}.${ZEST_VAULT}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch Zest APY:", error);

    return NextResponse.json(
      {
        supplyApyPercent: 5.42,
        borrowApyPercent: 8.1,
        utilizationPercent: 66.9,
        totalSbtcDeposited: 0,
        source: "fallback",
        contract: `${ZEST_DEPLOYER}.${ZEST_VAULT}`,
        timestamp: new Date().toISOString(),
        error: "Could not reach Zest mainnet — using fallback values",
      },
      { status: 200 },
    );
  }
}
