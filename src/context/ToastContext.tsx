"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  txId?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (
    type: ToastType,
    title: string,
    message?: string,
    txId?: string,
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, txId?: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, title, message, txId }]);
      // Auto-dismiss after 8 seconds
      setTimeout(() => removeToast(id), 8000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              animate-in slide-in-from-right fade-in duration-300
              rounded-xl border p-4 shadow-2xl backdrop-blur-sm
              ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30" : ""}
              ${toast.type === "error" ? "bg-red-500/10 border-red-500/30" : ""}
              ${toast.type === "info" ? "bg-indigo-500/10 border-indigo-500/30" : ""}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {toast.type === "success" && (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                )}
                {toast.type === "error" && (
                  <XCircle size={18} className="text-red-400" />
                )}
                {toast.type === "info" && (
                  <Info size={18} className="text-indigo-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-sm ${
                    toast.type === "success"
                      ? "text-emerald-400"
                      : toast.type === "error"
                        ? "text-red-400"
                        : "text-indigo-400"
                  }`}
                >
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-slate-400 text-xs mt-1">{toast.message}</p>
                )}
                {toast.txId && (
                  <a
                    href={`https://explorer.hiro.so/txid/${toast.txId}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 text-xs mt-1 hover:underline inline-block cursor-pointer"
                  >
                    View on Explorer →
                  </a>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
