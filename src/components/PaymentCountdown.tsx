"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

// A once-per-second clock shared by every subscriber; null on the server so the markup is stable.
let now = 0;
function subscribe(callback: () => void) {
  now = Math.floor(Date.now() / 1000);
  const id = setInterval(() => {
    now = Math.floor(Date.now() / 1000);
    callback();
  }, 1000);
  return () => clearInterval(id);
}
const getSnapshot = () => now || Math.floor(Date.now() / 1000);
const getServerSnapshot = () => null;

export default function PaymentCountdown({ deadline }: { deadline: string }) {
  const router = useRouter();
  const nowSeconds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const deadlineSeconds = Math.floor(new Date(deadline).getTime() / 1000);
  const remaining = nowSeconds === null ? null : Math.max(0, deadlineSeconds - nowSeconds);
  const refreshed = useRef(false);

  useEffect(() => {
    if (remaining === 0 && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
  }, [remaining, router]);

  const label =
    remaining === null
      ? "--:--"
      : `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const critical = remaining !== null && remaining <= 120;

  return (
    <div data-deadline className={`alert ${critical ? "alert-danger" : "alert-warning"}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[12px] font-medium tracking-[0.14em] uppercase">Complete payment within</span>
        <span className="font-serif text-3xl font-medium tabular-nums" role="timer" aria-live="off">
          {label}
        </span>
      </div>
      <p className="mt-1 text-[13px]">
        {remaining === 0
          ? "Time is up — refreshing your order status…"
          : "This order will be cancelled automatically if payment proof isn't uploaded in time."}
      </p>
    </div>
  );
}
