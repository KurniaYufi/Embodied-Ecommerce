"use client";

import { createPortal } from "react-dom";
import { useHydrated } from "@/lib/localStore";

/**
 * Renders overlays at the end of <body>. Needed because ancestors such as the sticky header use
 * `backdrop-filter`, which turns them into the containing block for `position: fixed` children.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  return hydrated ? createPortal(children, document.body) : null;
}
