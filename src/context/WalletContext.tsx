"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ConnectModal } from "@/components/layout/ConnectModal";
import { useToast } from "@/context/ToastContext";

// ─── Storage key for persisting wallet address ───────────────────────────────
const WALLET_STORAGE_KEY = "vort_wallet_address";

// ─── Types ───────────────────────────────────────────────────────────────────
interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
  connect: () => void;
  connectDirectly: (walletId: "leather" | "xverse") => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
  address: null,
  isConnected: false,
  isLoading: true,
  isConnectModalOpen: false,
  setIsConnectModalOpen: () => {},
  connect: () => {},
  connectDirectly: () => {},
  disconnect: () => {},
});

// ─── Helper: extract STX testnet address from provider response ──────────────
function extractStxAddress(addresses: any[]): string | null {
  // Leather returns addresses with purpose "stacks"
  const stxAddr = addresses.find(
    (a: any) =>
      a.symbol === "STX" || a.purpose === "stacks" || a.type === "stacks",
  );

  if (stxAddr) return stxAddr.address;

  // Fallback: first address
  if (addresses.length > 0) return addresses[0].address;

  return null;
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  // Restore persisted address on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WALLET_STORAGE_KEY);
      if (saved) setAddress(saved);
    } catch (_e) {}
    setIsLoading(false);
  }, []);

  // ── connect: always show our custom modal first ───────────────────────────
  const connect = useCallback(() => {
    setIsConnectModalOpen(true);
  }, []);

  // ── connectDirectly: talk to the wallet extension directly ───────────────
  const connectDirectly = useCallback(
    async (walletId: "leather" | "xverse") => {
      let provider: any;

      if (walletId === "leather") {
        provider = (window as any).LeatherProvider;
        if (!provider) {
          window.open("https://leather.io/install-extension", "_blank");
          return;
        }
      } else if (walletId === "xverse") {
        provider =
          (window as any).XverseProviders?.StacksProvider ||
          (window as any).BitcoinProvider;
        if (!provider) {
          window.open("https://www.xverse.app/download", "_blank");
          return;
        }
      }

      try {
        // Call the wallet extension directly — NO Stacks Connect UI involved
        const response = await provider.request("getAddresses");

        // Parse addresses from the response
        const addresses =
          response?.result?.addresses || response?.addresses || [];

        const stxAddress = extractStxAddress(addresses);

        if (stxAddress) {
          setAddress(stxAddress);
          localStorage.setItem(WALLET_STORAGE_KEY, stxAddress);
          setIsConnectModalOpen(false);
          addToast(
            "success",
            "Wallet Connected",
            `Connected to ${stxAddress.slice(0, 6)}...${stxAddress.slice(-4)}`,
          );
          router.push("/dashboard");
        } else {
          addToast(
            "error",
            "Connection Failed",
            "No STX address found. Please try again.",
          );
        }
      } catch (error: any) {
        if (
          error?.code === 4001 ||
          error?.message?.includes("cancel") ||
          error?.message?.includes("denied")
        ) {
          addToast(
            "info",
            "Connection Cancelled",
            "You cancelled the wallet connection.",
          );
        } else {
          addToast(
            "error",
            "Connection Failed",
            "Something went wrong. Please try again.",
          );
        }
        setIsConnectModalOpen(false);
      }
    },
    [router, addToast],
  );

  // ── disconnect ───────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isLoading,
        isConnectModalOpen,
        setIsConnectModalOpen,
        connect,
        connectDirectly,
        disconnect,
      }}
    >
      {children}
      <ConnectModal />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
