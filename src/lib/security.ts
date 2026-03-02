/**
 * Security Utilities — Server-Only
 *
 * Provides:
 *  - HMAC-SHA256 webhook signature verification
 *  - Stacks address validation
 *  - Numeric input sanitization
 *  - In-memory rate limiter
 *  - Safe logging (never logs secrets, keys, or raw payloads)
 */

import { createHmac, timingSafeEqual } from "crypto";

// ============================================================
//  1. HMAC Webhook Verification
// ============================================================

/**
 * Verifies that a Chainhook webhook payload was signed with our shared secret.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature || !secret || !rawBody) return false;

  try {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (sigBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

// ============================================================
//  2. Input Validation
// ============================================================

/**
 * Validates a Stacks (STX) wallet address.
 * Standard addresses: SP/ST prefix followed by a c32check-encoded body.
 * Real example: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM (41 chars total).
 * Contract principals: standard address + ".contract-name".
 */
const STX_ADDRESS_REGEX =
  /^(SP|ST)[0-9A-HJ-NP-Za-hj-np-z]{28,40}(\.[a-zA-Z][a-zA-Z0-9\-]{0,39})?$/;

export function validateStxAddress(address: unknown): address is string {
  if (typeof address !== "string") return false;
  if (address.length < 30 || address.length > 128) return false;
  return STX_ADDRESS_REGEX.test(address);
}

/**
 * Parses a string into a safe positive number.
 * Returns null if the input is not a valid finite positive number.
 * Prevents NaN, Infinity, negative values, and string injection.
 */
export function sanitizeNumericInput(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }
  if (typeof value !== "string") return null;

  // Strip any non-numeric characters except decimal point
  const cleaned = value.trim();
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

// ============================================================
//  3. Rate Limiter (In-Memory Sliding Window)
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60_000);

/**
 * Simple sliding-window rate limiter.
 * Returns { allowed: true } if the request is within limits,
 * or { allowed: false, retryAfterMs } if rate-limited.
 *
 * @param key     – Unique identifier (e.g. IP address or "ip:route")
 * @param limit   – Max requests per window
 * @param windowMs – Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number = 30,
  windowMs: number = 60_000,
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true };
}

// ============================================================
//  4. Safe Logger
// ============================================================

/**
 * Logs a structured message. NEVER pass raw payloads, keys,
 * signatures, or tokens as data.
 *
 * Only logs: requestId, timestamp, level, message, and optional
 * non-sensitive metadata (counts, event types, durations).
 */
export function safeLog(
  level: "info" | "warn" | "error",
  message: string,
  meta?: Record<string, string | number | boolean>,
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta || {}),
  };

  // Use structured JSON logging for production parseability
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ============================================================
//  5. Request IP Extraction
// ============================================================

/**
 * Extracts the client IP from a Next.js request.
 * Falls back safely if headers are missing.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take only the first IP in the chain (the client)
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
