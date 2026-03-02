/**
 * Protocol State Endpoint
 * GET /api/protocol
 *
 * Returns cached global protocol state from the KV store.
 * This is public data (TVL, epoch ID, minted totals).
 * No authentication required.
 *
 * Security:
 *  - Read-only (GET only)
 *  - Rate limited per IP
 *  - No user-specific data exposed
 */

import { NextRequest, NextResponse } from "next/server";
import { getProtocolState } from "@/lib/kv";
import { checkRateLimit, getClientIp, safeLog } from "@/lib/security";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limit: 120 requests per minute per IP
  const rateCheck = checkRateLimit(`protocol:${ip}`, 120, 60_000);
  if (!rateCheck.allowed) {
    safeLog("warn", "Protocol endpoint rate limited", { ip });
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

  const state = await getProtocolState();

  return NextResponse.json(state, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
    },
  });
}

// Disallow other methods
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
