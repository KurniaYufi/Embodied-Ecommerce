"use client";

import { useId, useRef } from "react";
import { useModalBehaviour } from "./Drawer";
import { CloseIcon } from "./Icons";
import Portal from "./Portal";

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalBehaviour(open, onClose, ref);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:px-4 sm:py-8">
        <div className="absolute inset-0 bg-black/45" onClick={onClose} />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`animate-fade-up relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-paper p-6 text-ink shadow-2xl sm:p-7`}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 id={titleId} className="display text-2xl">
              {title}
            </h3>
            <button type="button" onClick={onClose} aria-label="Close" className="icon-btn -mt-1 -mr-2 shrink-0">
              <CloseIcon />
            </button>
          </div>
          {children}
        </div>
      </div>
    </Portal>
  );
}
