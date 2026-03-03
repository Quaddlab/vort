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

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => void;
  disconnect: () => void;
}

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

const WalletContext = createContext<WalletState>({
  address: null,
  isConnected: false,
  isLoading: true,
  connect: () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    authenticate({
      appDetails: {
        name: "Vort",
        icon: "/favicon.ico",
      },
      onFinish: () => {
        const userData = userSession.loadUserData();
        const network =
          process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? "mainnet" : "testnet";
        const addr = userData.profile?.stxAddress?.[network] || null;
        setAddress(addr);
        router.push("/dashboard");
      },
      onCancel: () => {},
      userSession,
    });
  }, [router]);

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
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
