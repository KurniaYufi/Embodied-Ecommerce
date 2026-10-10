"use client";

import { CloseIcon } from "./Icons";

export const ANNOUNCEMENT_KEY = "embodied-announcement-dismissed";

/**
 * Dismissal lasts for the browser session only, so the bar is shown again every time the site is
 * opened fresh. The root layout's head script applies the hidden state before paint (no flash).
 */
export default function AnnouncementBar({ children }: { children: React.ReactNode }) {
  const dismiss = () => {
    try {
      window.sessionStorage.setItem(ANNOUNCEMENT_KEY, "1");
    } catch {}
    document.documentElement.classList.add("announcement-dismissed");
  };

  return (
    <div data-announcement className="relative bg-ink px-12 py-2 text-center text-[11px] tracking-[0.14em] text-paper">
      {children}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute top-1/2 right-2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center opacity-70 transition-opacity hover:opacity-100 sm:right-4"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
