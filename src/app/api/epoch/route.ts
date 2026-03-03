import { NextResponse } from "next/server";
import { cvToJSON, deserializeCV } from "@stacks/transactions";
import { PUBLIC_CONFIG } from "@/lib/env";

export async function GET() {
  try {
    const deployer = PUBLIC_CONFIG.contractDeployer;
    const url = `https://api.testnet.hiro.so/v2/contracts/call-read/${deployer}/tokenizer/get-epoch-info`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: deployer,
        arguments: [],
      }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch epoch info");
    const data = await res.json();

    if (!data.result || !data.result.startsWith("0x")) {
      throw new Error("Invalid response");
    }

    const cv = deserializeCV(data.result);
    const json = cvToJSON(cv);

    // For a raw tuple, cvToJSON typically returns an object with the tuple fields as keys
    // and objects { type, value } as values.
    const tuple = json.value || json;

    const extractUint = (obj: any) => {
      if (!obj) return 0;
      if (typeof obj.value === "string" || typeof obj.value === "number")
        return Number(obj.value);
      return 0;
    };

    const extractBool = (obj: any) => {
      if (!obj) return false;
      if (typeof obj.value === "boolean") return obj.value;
      if (obj.type === "bool-true") return true;
      if (obj.type === "bool-false") return false;
      return false;
    };

    const epochId = extractUint(tuple["epoch-id"]);
    const startBlock = extractUint(tuple["start-block"]);
    const endBlock = extractUint(tuple["end-block"]);
    const totalDeposits = extractUint(tuple["total-deposits"]) / 1e8;
    const isMature = extractBool(tuple["is-mature"]);
    const blocksRemaining = extractUint(tuple["blocks-remaining"]);

    // Calculate ETA (1 block ≈ 10 minutes)
    const msRemaining = blocksRemaining * 10 * 60 * 1000;
    const estimatedMaturityDate = new Date(
      Date.now() + msRemaining,
    ).toISOString();

    return NextResponse.json({
      epochId,
      startBlock,
      endBlock,
      totalDeposits,
      isMature,
      blocksRemaining,
      estimatedMaturityDate,
    });
  } catch (error) {
    console.error("Failed to fetch epoch info:", error);

    // Fallback if the network call fails
    return NextResponse.json({
      epochId: 120,
      startBlock: 0,
      endBlock: 0,
      totalDeposits: 0,
      isMature: false,
      blocksRemaining: 17280, // ~120 days
      estimatedMaturityDate: new Date(
        Date.now() + 17280 * 10 * 60 * 1000,
      ).toISOString(),
    });
  }
}
