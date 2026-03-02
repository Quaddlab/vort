/**
 * Pricing & Yield Engine — Server-Only
 *
 * Pure TypeScript math module that calculates:
 *  - Time-decaying PT price based on the AMM curve
 *  - Implied annualized fixed yield from PT price
 *  - AMM k-parameter based on epoch progress
 *
 * This runs exclusively on the Next.js server to avoid exposing
 * pricing internals on the client and to save Clarity execution costs.
 *
 * The math mirrors the on-chain pt-amm.clar logic exactly, so the
 * frontend preview always matches what the contract will compute.
 */

// ============================================================
//  Constants
// ============================================================

/** Days in a year for annualization */
const DAYS_PER_YEAR = 365;

/** The initial k-factor at epoch start (higher = more curvature) */
const K_INITIAL = 0.5;

/** The final k-factor at epoch maturity (approaches linearity as PT → 1.0) */
const K_FINAL = 0.01;

// ============================================================
//  1. AMM Parameters
// ============================================================

/**
 * Calculates the current AMM k-parameter based on epoch time progression.
 * k decays linearly from K_INITIAL to K_FINAL as the epoch progresses.
 * At maturity, k approaches K_FINAL, making the curve nearly linear (PT ≈ 1.0).
 *
 * @param epochStartBlock  – The Stacks block height when the epoch started
 * @param epochEndBlock    – The Stacks block height when the epoch matures
 * @param currentBlock     – The current Stacks block height
 * @returns The current k parameter (0 < k <= K_INITIAL)
 */
export function getAmmKParameter(
  epochStartBlock: number,
  epochEndBlock: number,
  currentBlock: number,
): number {
  // Clamp current block within epoch bounds
  const clampedBlock = Math.max(
    epochStartBlock,
    Math.min(currentBlock, epochEndBlock),
  );

  const totalBlocks = epochEndBlock - epochStartBlock;
  if (totalBlocks <= 0) return K_FINAL;

  const elapsed = clampedBlock - epochStartBlock;
  const progress = elapsed / totalBlocks; // 0.0 → 1.0

  // Linear decay from K_INITIAL to K_FINAL
  return K_INITIAL - progress * (K_INITIAL - K_FINAL);
}

// ============================================================
//  2. PT Price Calculation
// ============================================================

/**
 * Calculates the current Principal Token price in terms of sBTC.
 * As maturity approaches, PT price naturally drifts towards 1.0 sBTC.
 *
 * The price formula uses a simplified constant-product variant:
 *   price = 1 - k * (daysRemaining / totalDays)
 *
 * This means:
 *  - At epoch start with k=0.5 and 120 days remaining → PT ≈ 0.50
 *  - Mid-epoch → PT ≈ 0.75
 *  - Near maturity → PT → 1.0
 *
 * @param daysRemaining – Days until epoch maturity
 * @param totalDays     – Total epoch duration in days
 * @param k             – Current AMM k-parameter
 * @returns PT price in sBTC (0 < price <= 1.0)
 */
export function calculatePtPrice(
  daysRemaining: number,
  totalDays: number,
  k: number,
): number {
  if (totalDays <= 0) return 1.0;
  if (daysRemaining <= 0) return 1.0;

  const timeWeight = Math.min(daysRemaining / totalDays, 1.0);
  const price = 1.0 - k * timeWeight;

  // Clamp between 0 and 1
  return Math.max(0, Math.min(price, 1.0));
}

// ============================================================
//  3. Implied Yield Calculation
// ============================================================

/**
 * Derives the annualized implied fixed yield from the current PT price.
 *
 * The formula:
 *   yield = ((1 / ptPrice) - 1) * (365 / daysRemaining) * 100
 *
 * Example: If PT trades at 0.985 with 40 days remaining:
 *   yield = ((1/0.985) - 1) * (365/40) * 100 ≈ 13.9% APY
 *
 * @param ptPrice        – Current PT price in sBTC (0 < price <= 1.0)
 * @param daysRemaining  – Days until epoch maturity
 * @returns Annualized implied yield as a percentage (e.g. 5.42)
 */
export function calculateImpliedYield(
  ptPrice: number,
  daysRemaining: number,
): number {
  if (ptPrice <= 0 || ptPrice >= 1.0) return 0;
  if (daysRemaining <= 0) return 0;

  const discount = 1.0 / ptPrice - 1.0;
  const annualized = discount * (DAYS_PER_YEAR / daysRemaining) * 100;

  // Round to 2 decimal places
  return Math.round(annualized * 100) / 100;
}

// ============================================================
//  4. Convenience: Get Full Pricing Snapshot
// ============================================================

export interface PricingSnapshot {
  ptPrice: number;
  impliedYield: number;
  kParameter: number;
  daysRemaining: number;
  epochProgress: number;
}

/**
 * Computes a complete pricing snapshot for display on the frontend.
 * Called as a server-side function and passed to React components as props.
 *
 * @param epochStartBlock  – Epoch start block height
 * @param epochEndBlock    – Epoch end block height
 * @param currentBlock     – Current block height
 * @param totalDays        – Total epoch duration in days (e.g. 120)
 * @param daysRemaining    – Days until maturity
 */
export function getPricingSnapshot(
  epochStartBlock: number,
  epochEndBlock: number,
  currentBlock: number,
  totalDays: number,
  daysRemaining: number,
): PricingSnapshot {
  const k = getAmmKParameter(epochStartBlock, epochEndBlock, currentBlock);
  const ptPrice = calculatePtPrice(daysRemaining, totalDays, k);
  const impliedYield = calculateImpliedYield(ptPrice, daysRemaining);

  const totalBlocks = epochEndBlock - epochStartBlock;
  const elapsed = Math.max(0, currentBlock - epochStartBlock);
  const epochProgress =
    totalBlocks > 0 ? Math.round((elapsed / totalBlocks) * 10000) / 100 : 100;

  return {
    ptPrice: Math.round(ptPrice * 10000) / 10000,
    impliedYield,
    kParameter: Math.round(k * 10000) / 10000,
    daysRemaining: Math.max(0, daysRemaining),
    epochProgress: Math.min(100, epochProgress),
  };
}
