"use client";

import { useEffect, useId, useRef } from "react";
import { CloseIcon } from "./Icons";
import Portal from "./Portal";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared modal behaviour: Escape closes, focus moves inside and is trapped while open,
 * focus returns to the trigger on close, and the page behind does not scroll.
 */
export function useModalBehaviour(open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement | null>) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = ref.current;

    const focusFirst = () => {
      const first =
        container?.querySelector<HTMLElement>("[data-autofocus]") ?? container?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !container) return;
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null || n === document.activeElement
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused?.focus?.();
    };
  }, [open, ref]);
}

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  side?: "left" | "right";
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
};

export default function Drawer({
  open,
  onClose,
  title,
  side = "right",
  children,
  footer,
  widthClass = "w-full max-w-md",
}: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalBehaviour(open, onClose, ref);

  const hidden = side === "right" ? "translate-x-full" : "-translate-x-full";

  return (
    <Portal>
      <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          inert={!open}
          className={`absolute inset-y-0 ${side === "right" ? "right-0" : "left-0"} flex ${widthClass} flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : hidden
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
            <h2 id={titleId} className="display text-xl">
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label="Close" className="icon-btn -mr-2">
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer && <div className="border-t border-line px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}
