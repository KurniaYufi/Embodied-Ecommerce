"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const SCROLL_THRESHOLD = 8;

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}
const getScrolled = () => window.scrollY > SCROLL_THRESHOLD;
const getServerScrolled = () => false;

/**
 * Sticky header that stays transparent at the top of the page and gains its background once the
 * page is scrolled. On the homepage it sits over the dark hero photo, so it switches to light
 * text (`data-tone="light"`) until the background appears.
 */
export default function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribe, getScrolled, getServerScrolled);
  const overHero = pathname === "/" && !scrolled;

  return (
    <header
      data-tone={overHero ? "light" : "default"}
      data-scrolled={scrolled || undefined}
      className={`group/header sticky top-0 z-40 border-b transition-[background-color,border-color,color] duration-300 ${
        scrolled
          ? "border-line bg-paper/90 text-ink backdrop-blur-md supports-backdrop-filter:bg-paper/80"
          : `border-transparent bg-transparent ${overHero ? "text-white" : "text-ink"}`
      }`}
    >
      {children}
    </header>
  );
}
