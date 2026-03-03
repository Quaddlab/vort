/**
 * Client-side Stacks contract interaction helpers.
 * Uses @stacks/transactions to build and broadcast contract calls
 * through the user's connected Leather/Xverse wallet.
 */

import { openContractCall, type FinishedTxData } from "@stacks/connect";
import { uintCV, principalCV, PostConditionMode } from "@stacks/transactions";

const DEPLOYER =
  process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER ||
  "ST3SJNP6KGJVT5ZBS1Q7T8RQVMFAZ16W80ZST1W44";

const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";

// 8 decimals for sBTC/PT/YT tokens
const DECIMALS = 8;

/** Convert a human-readable amount (e.g. "1.5") to on-chain micro-units */
export function toMicroUnits(amount: string | number): number {
  return Math.floor(Number(amount) * 10 ** DECIMALS);
}

/** Convert on-chain micro-units to human-readable amount */
export function fromMicroUnits(micro: number): number {
  return micro / 10 ** DECIMALS;
}

/** Format a micro-unit balance for display */
export function formatBalance(micro: number, decimals = 4): string {
  const val = fromMicroUnits(micro);
  if (val === 0) return "0.00";
  return val.toFixed(decimals).replace(/\.?0+$/, "") || "0";
}

// ============================================================
//  Contract Call Helpers
// ============================================================

/**
 * Deposit sBTC into the tokenizer to mint PT + YT 1:1.
 * Triggers a Leather wallet popup for the user to sign.
 */
export function depositSbtc(
  amount: string,
  onFinish: (data: FinishedTxData) => void,
  onCancel?: () => void,
) {
  const microAmount = toMicroUnits(amount);
  if (microAmount <= 0) throw new Error("Amount must be greater than 0");

  openContractCall({
    contractAddress: DEPLOYER,
    contractName: "tokenizer",
    functionName: "deposit",
    functionArgs: [uintCV(microAmount)],
    postConditionMode: PostConditionMode.Allow,
    network: NETWORK as "testnet" | "mainnet",
    onFinish,
    onCancel: onCancel || (() => {}),
  });
}

/**
 * Redeem PT + YT back to sBTC (only after epoch maturity).
 */
export function redeemTokens(
  amount: string,
  onFinish: (data: FinishedTxData) => void,
  onCancel?: () => void,
) {
  const microAmount = toMicroUnits(amount);
  if (microAmount <= 0) throw new Error("Amount must be greater than 0");

  openContractCall({
    contractAddress: DEPLOYER,
    contractName: "tokenizer",
    functionName: "redeem",
    functionArgs: [uintCV(microAmount)],
    postConditionMode: PostConditionMode.Allow,
    network: NETWORK as "testnet" | "mainnet",
    onFinish,
    onCancel: onCancel || (() => {}),
  });
}

/**
 * Claim accrued yield from the yield router.
 */
export function claimYield(
  onFinish: (data: FinishedTxData) => void,
  onCancel?: () => void,
) {
  openContractCall({
    contractAddress: DEPLOYER,
    contractName: "yield-router-v2",
    functionName: "claim-yield",
    functionArgs: [],
    postConditionMode: PostConditionMode.Allow,
    network: NETWORK as "testnet" | "mainnet",
    onFinish,
    onCancel: onCancel || (() => {}),
  });
}

/**
 * Swap sBTC for PT on the AMM.
 */
export function swapSbtcForPt(
  sbtcAmount: string,
  minPtOut: number,
  onFinish: (data: FinishedTxData) => void,
  onCancel?: () => void,
) {
  const microAmount = toMicroUnits(sbtcAmount);
  if (microAmount <= 0) throw new Error("Amount must be greater than 0");

  openContractCall({
    contractAddress: DEPLOYER,
    contractName: "pt-amm",
    functionName: "swap-sbtc-for-pt",
    functionArgs: [uintCV(microAmount), uintCV(minPtOut)],
    postConditionMode: PostConditionMode.Allow,
    network: NETWORK as "testnet" | "mainnet",
    onFinish,
    onCancel: onCancel || (() => {}),
  });
}

/**
 * Swap PT for sBTC on the AMM.
 */
export function swapPtForSbtc(
  ptAmount: string,
  minSbtcOut: number,
  onFinish: (data: FinishedTxData) => void,
  onCancel?: () => void,
) {
  const microAmount = toMicroUnits(ptAmount);
  if (microAmount <= 0) throw new Error("Amount must be greater than 0");

  openContractCall({
    contractAddress: DEPLOYER,
    contractName: "pt-amm",
    functionName: "swap-pt-for-sbtc",
    functionArgs: [uintCV(microAmount), uintCV(minSbtcOut)],
    postConditionMode: PostConditionMode.Allow,
    network: NETWORK as "testnet" | "mainnet",
    onFinish,
    onCancel: onCancel || (() => {}),
  });
}

/**
 * Mint test sBTC for testing purposes (testnet only).
 */
export function mintTestSbtc(
  amount: string,
  recipient: string,
  onFinish: (data: FinishedTxData) => void,
  onCancel?: () => void,
) {
  const microAmount = toMicroUnits(amount);
  if (microAmount <= 0) throw new Error("Amount must be greater than 0");

  openContractCall({
    contractAddress: DEPLOYER,
    contractName: "sbtc-token",
    functionName: "mint-for-testing",
    functionArgs: [uintCV(microAmount), principalCV(recipient)],
    postConditionMode: PostConditionMode.Allow,
    network: NETWORK as "testnet" | "mainnet",
    onFinish,
    onCancel: onCancel || (() => {}),
  });
}
