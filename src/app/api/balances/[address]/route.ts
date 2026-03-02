/**
 * User Balances Endpoint
 * GET /api/balances/:address
 *
 * Fetches PT, YT, sBTC, and STX balances for a specific Stacks address
 * on-demand from the Hiro API. User data is NEVER cached in the backend.
 *
 * Security:
 *  - Strict address validation (rejects malformed addresses with 400)
 *  - Rate limited per address to prevent abuse
 *  - No user data stored server-side
 *  - Never logs full balance responses
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserBalances } from "@/lib/hiro";
import {
  validateStxAddress,
  checkRateLimit,
  getClientIp,
  safeLog,
} from "@/lib/security";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  const ip = getClientIp(request);
  const requestId = crypto.randomUUID();

  // ---- Validate Address ----
  const addressPrefix = address ? address.slice(0, 4) : "N/A";
  if (!validateStxAddress(address)) {
    safeLog("warn", "Invalid address rejected", {
      requestId,
      ip,
      addressPrefix,
    });
    return NextResponse.json(
      { error: "Invalid Stacks address format" },
      { status: 400 },
    );
  }

  // ---- Rate Limit (per address to prevent scraping) ----
  const rateCheck = checkRateLimit(`balances:${address}`, 30, 60_000);
  if (!rateCheck.allowed) {
    safeLog("warn", "Balances endpoint rate limited", { requestId, ip });
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateCheck.retryAfterMs || 60_000) / 1000),
          ),
        },
      },
    );
  }

  // ---- Fetch from Hiro API ----
  try {
    const balances = await getUserBalances(address);

    safeLog("info", "Balances fetched successfully", {
      requestId,
      // Only log a truncated address — never the full thing
      addressPrefix: `${address.slice(0, 6)}...`,
    });

    return NextResponse.json(balances, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    safeLog("error", "Failed to fetch balances", {
      requestId,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to fetch balances from blockchain" },
      { status: 502 },
    );
  }
}

// Disallow other methods
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
