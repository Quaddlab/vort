"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppConfig, UserSession } from "@stacks/connect";
import { useRouter } from "next/navigation";
import { ConnectModal } from "@/components/layout/ConnectModal";
import { v4 as uuidv4 } from "uuid"; // Need to generate transit auth keys manually

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

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

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

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const network =
        process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? "mainnet" : "testnet";
      const addr = userData.profile?.stxAddress?.[network] || null;
      setAddress(addr);
    }
    setIsLoading(false);
  }, []);

  const connect = useCallback(() => {
    // 1. If Leather is installed, connect directly immediately (bypass modal)
    if (typeof window !== "undefined" && (window as any).LeatherProvider) {
      connectDirectly("leather");
      return;
    }

    // 2. Fallback: if not installed, open the modal to show options/install links
    setIsConnectModalOpen(true);
  }, []);

  const connectDirectly = useCallback(
    (walletId: "leather" | "xverse") => {
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

      // We bypass @stacks/connect authenticate() completely to avoid the UI popups.
      // Instead we manually get the payload from the session and send it to the provider.

      const appDetails = {
        name: "Vort",
        icon: window.location.origin + "/favicon.ico",
      };

      const transitKey = userSession.generateAndStoreTransitKey();
      const authRequest = userSession.makeAuthRequest(
        transitKey,
        `${window.location.origin}/`,
        `${window.location.origin}/`,
        ["store_write"],
        appDetails.name,
        appDetails.icon,
        `${window.location.origin}/`,
      );

      try {
        provider
          .authenticationRequest(authRequest)
          .then(async (authResponse: string) => {
            await userSession.handlePendingSignIn(authResponse);
            const userData = userSession.loadUserData();
            const network =
              process.env.NEXT_PUBLIC_NETWORK === "mainnet"
                ? "mainnet"
                : "testnet";
            const addr = userData.profile?.stxAddress?.[network] || null;
            setAddress(addr);
            setIsConnectModalOpen(false);
            router.push("/dashboard");
          })
          .catch((error: any) => {
            console.error("Wallet connection cancelled or failed:", error);
            setIsConnectModalOpen(false);
          });
      } catch (error) {
        console.error("Failed to send auth request to provider:", error);
        setIsConnectModalOpen(false);
      }
    },
    [router],
  );

  const disconnect = useCallback(() => {
    userSession.signUserOut();
    setAddress(null);
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
