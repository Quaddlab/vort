/**
 * Chainhook Webhook Endpoint
 * POST /api/webhooks/chainhook
 *
 * Receives event payloads from Hiro Chainhooks v2 when on-chain events
 * (Mints, Burns, Swaps) occur on the tokenizer.clar or pt-amm.clar contracts.
 *
 * Security:
 *  - HMAC-SHA256 signature verification on every request
 *  - Rate limiting per IP
 *  - Safe logging (never logs raw payload bodies)
 *  - No user input alters state — only signed Chainhook events do
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import {
  verifyWebhookSignature,
  checkRateLimit,
  safeLog,
  getClientIp,
} from "@/lib/security";
import {
  incrementMintTotals,
  decrementBurnTotals,
  setProtocolState,
} from "@/lib/kv";

// Only allow POST
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const requestId = crypto.randomUUID();

  // ---- Rate Limit ----
  const rateCheck = checkRateLimit(`chainhook:${ip}`, 60, 60_000);
  if (!rateCheck.allowed) {
    safeLog("warn", "Chainhook webhook rate limited", { requestId, ip });
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

  // ---- Read Raw Body ----
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    safeLog("error", "Failed to read webhook body", { requestId });
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!rawBody || rawBody.length === 0) {
    safeLog("warn", "Empty webhook body received", { requestId });
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  // ---- HMAC Signature Verification ----
  const env = getServerEnv();
  const signature = request.headers.get("x-chainhook-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature, env.chainhookAuthToken)) {
    safeLog("error", "Invalid webhook signature — rejecting", {
      requestId,
      ip,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---- Parse Payload ----
  let payload: ChainhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    safeLog("error", "Malformed JSON in webhook payload", { requestId });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ---- Process Events ----
  try {
    const eventsProcessed = await processEvents(payload, requestId);
    safeLog("info", "Chainhook webhook processed", {
      requestId,
      eventsProcessed,
    });
    return NextResponse.json({ ok: true, eventsProcessed });
  } catch (err) {
    safeLog("error", "Failed to process webhook events", {
      requestId,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

// ---- Disallow other methods ----
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

// ============================================================
//  Event Processing
// ============================================================

interface ChainhookEvent {
  type: string;
  data?: {
    amount?: number;
    block_height?: number;
  };
}

interface ChainhookPayload {
  apply?: Array<{
    transactions?: Array<{
      metadata?: {
        receipt?: {
          events?: ChainhookEvent[];
        };
      };
    }>;
    block_identifier?: {
      index?: number;
    };
  }>;
}

async function processEvents(
  payload: ChainhookPayload,
  requestId: string,
): Promise<number> {
  let count = 0;

  if (!payload.apply || !Array.isArray(payload.apply)) {
    safeLog("warn", "No apply blocks in payload", { requestId });
    return 0;
  }

  for (const block of payload.apply) {
    const blockHeight = block.block_identifier?.index ?? 0;

    if (!block.transactions || !Array.isArray(block.transactions)) continue;

    for (const tx of block.transactions) {
      const events = tx.metadata?.receipt?.events;
      if (!events || !Array.isArray(events)) continue;

      for (const event of events) {
        const amount = event.data?.amount;
        if (typeof amount !== "number" || amount <= 0) continue;

        switch (event.type) {
          case "mint":
            await incrementMintTotals(amount, blockHeight);
            safeLog("info", "Mint event indexed", {
              requestId,
              amount,
              blockHeight,
            });
            count++;
            break;

          case "burn":
            await decrementBurnTotals(amount, blockHeight);
            safeLog("info", "Burn event indexed", {
              requestId,
              amount,
              blockHeight,
            });
            count++;
            break;

          case "swap":
            // Swaps don't change TVL, but we can log them
            safeLog("info", "Swap event indexed", {
              requestId,
              amount,
              blockHeight,
            });
            count++;
            break;

          default:
            safeLog("warn", "Unknown event type", {
              requestId,
              eventType: event.type,
            });
        }
      }
    }
  }

  return count;
}
