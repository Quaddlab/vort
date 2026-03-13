/**
 * Client-side Stacks contract interaction helpers.
 * Uses @stacks/transactions to build and broadcast contract calls
 * through the user's connected Leather/Xverse wallet.
 *
 * V3: All contracts now use the real testnet sBTC at
 *     ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token
 */

import { openContractCall, type FinishedTxData } from "@stacks/connect";
import {
  uintCV,
  PostConditionMode,
  Pc,
} from "@stacks/transactions";
import { PUBLIC_CONFIG } from "./env";

const DEPLOYER =
  process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER ||
  "ST3SJNP6KGJVT5ZBS1Q7T8RQVMFAZ16W80ZST1W44";

const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";

// Real testnet sBTC contract
const SBTC_CONTRACT = "ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token" as const;
const SBTC_ASSET = "sbtc-token" as const;

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
    contractName: PUBLIC_CONFIG.tokenizerContract,
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
    contractName: PUBLIC_CONFIG.tokenizerContract,
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
    contractName: PUBLIC_CONFIG.yieldRouterContract,
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
    contractName: PUBLIC_CONFIG.ptAmmContract,
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
    contractName: PUBLIC_CONFIG.ptAmmContract,
    functionName: "swap-pt-for-sbtc",
    functionArgs: [uintCV(microAmount), uintCV(minSbtcOut)],
    postConditionMode: PostConditionMode.Allow,
    network: NETWORK as "testnet" | "mainnet",
    onFinish,
    onCancel: onCancel || (() => {}),
  });
}

/**
 * Admin: Add initial liquidity to the PT AMM pool.
 */
export function addLiquidity(
  sbtcAmount: string,
  ptAmount: string,
  onFinish: (data: FinishedTxData) => void,
  onCancel?: () => void,
) {
  const microSbtc = toMicroUnits(sbtcAmount);
  const microPt = toMicroUnits(ptAmount);
  if (microSbtc <= 0 || microPt <= 0) throw new Error("Amounts must be greater than 0");

  const postConditions = [
    Pc.principal(DEPLOYER)
      .willSendEq(microSbtc)
      .ft(SBTC_CONTRACT, SBTC_ASSET),
    Pc.principal(DEPLOYER)
      .willSendEq(microPt)
      .ft(`${DEPLOYER}.pt-token`, "principal-token"),
  ];

  openContractCall({
    contractAddress: DEPLOYER,
    contractName: PUBLIC_CONFIG.ptAmmContract,
    functionName: "add-liquidity",
    functionArgs: [uintCV(microSbtc), uintCV(microPt)],
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    network: NETWORK as "testnet" | "mainnet",
    onFinish,
    onCancel: onCancel || (() => {}),
  });
}

/**
 * Admin: Simulate Zest Protocol yield by accruing sBTC into the Yield Router.
 * The v3 contract pulls sBTC from the caller into the contract first.
 */
export function accrueYield(
  sbtcAmount: string,
  onFinish: (data: FinishedTxData) => void,
  onCancel?: () => void,
) {
  const microSbtc = toMicroUnits(sbtcAmount);
  if (microSbtc <= 0) throw new Error("Amount must be greater than 0");

  const postConditions = [
    Pc.principal(DEPLOYER)
      .willSendEq(microSbtc)
      .ft(SBTC_CONTRACT, SBTC_ASSET),
  ];

  openContractCall({
    contractAddress: DEPLOYER,
    contractName: PUBLIC_CONFIG.yieldRouterContract,
    functionName: "accrue-yield",
    functionArgs: [uintCV(microSbtc)],
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    network: NETWORK as "testnet" | "mainnet",
    onFinish,
    onCancel: onCancel || (() => {}),
  });
}

/**
 * Polls the Stacks API until a transaction is confirmed or aborted.
 */
export async function waitForTransaction(txId: string): Promise<"success" | "failed"> {
  const url = `https://api.${NETWORK}.hiro.so/extended/v1/tx/${txId}`;
  /* eslint-disable-next-line no-constant-condition */
  while (true) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.tx_status === "success") return "success";
        if (data.tx_status && data.tx_status.startsWith("abort")) return "failed";
      }
    } catch (e) {
      console.error("Polling tx error:", e);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
