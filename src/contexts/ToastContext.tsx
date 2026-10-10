"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Link from "next/link";

type ToastTone = "default" | "success" | "error";
type ToastAction = { label: string; href?: string; onClick?: () => void };
type Toast = { id: number; message: string; tone: ToastTone; action?: ToastAction };

type ToastContextValue = {
  show: (message: string, options?: { tone?: ToastTone; action?: ToastAction }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue["show"]>(
    (message, options) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, message, tone: options?.tone ?? "default", action: options?.action }]);
      window.setTimeout(() => dismiss(id), options?.action ? 6000 : 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:px-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-up pointer-events-auto flex w-full max-w-sm items-center gap-4 px-4 py-3 text-sm shadow-lg ${
              t.tone === "error" ? "bg-danger text-white dark:text-neutral-950" : "bg-ink text-paper"
            }`}
          >
            <span className="flex-1">{t.message}</span>
            {t.action?.href && (
              <Link
                href={t.action.href}
                onClick={() => dismiss(t.id)}
                className="text-[11px] font-medium tracking-[0.16em] whitespace-nowrap uppercase underline underline-offset-4"
              >
                {t.action.label}
              </Link>
            )}
            {t.action && !t.action.href && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick?.();
                  dismiss(t.id);
                }}
                className="text-[11px] font-medium tracking-[0.16em] whitespace-nowrap uppercase underline underline-offset-4"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="-mr-1 inline-flex h-7 w-7 items-center justify-center opacity-70 hover:opacity-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
