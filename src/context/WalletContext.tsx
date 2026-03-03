"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppConfig, authenticate, UserSession } from "@stacks/connect";
import { useRouter } from "next/navigation";
import { ConnectModal } from "@/components/layout/ConnectModal";

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
    setIsConnectModalOpen(true);
  }, []);

  const connectDirectly = useCallback(
    (walletId: "leather" | "xverse") => {
      let provider: any;
      if (walletId === "leather") {
        provider = (window as any).LeatherProvider;
        if (!provider) {
          alert(
            "Leather Wallet not found. Please install the browser extension.",
          );
          return;
        }
      } else if (walletId === "xverse") {
        provider =
          (window as any).XverseProviders?.StacksProvider ||
          (window as any).BitcoinProvider;
        if (!provider) {
          alert(
            "Xverse Wallet not found. Please install the browser extension.",
          );
          return;
        }
      }

      authenticate(
        {
          appDetails: {
            name: "Vort",
            icon: "/favicon.ico",
          },
          onFinish: () => {
            const userData = userSession.loadUserData();
            const network =
              process.env.NEXT_PUBLIC_NETWORK === "mainnet"
                ? "mainnet"
                : "testnet";
            const addr = userData.profile?.stxAddress?.[network] || null;
            setAddress(addr);
            setIsConnectModalOpen(false);
            router.push("/dashboard");
          },
          onCancel: () => {
            setIsConnectModalOpen(false);
          },
          userSession,
        },
        provider,
      );
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
