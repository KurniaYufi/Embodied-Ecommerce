"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/logout";
import { UserIcon } from "./Icons";

export type HeaderUser = { name: string; email: string; role: string } | null;

export function accountLinks(user: NonNullable<HeaderUser>) {
  return user.role === "admin"
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings", href: "/settings/profile" },
      ]
    : [
        { label: "My Orders", href: "/account/orders" },
        { label: "Wishlist", href: "/wishlist" },
        { label: "Settings", href: "/settings/profile" },
      ];
}

export default function AccountMenu({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = usePathname();

  // Close when navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} aria-label="Log in" className="icon-btn">
        <UserIcon />
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="icon-btn"
      >
        <UserIcon />
        <span className="absolute right-2 bottom-2 h-1.5 w-1.5 rounded-full bg-success ring-2 ring-paper" aria-hidden />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="animate-fade-up absolute right-0 mt-2 w-60 border border-line bg-surface py-2 shadow-xl"
        >
          <div className="border-b border-line px-4 pt-1 pb-3">
            <p className="truncate text-sm font-medium text-ink">{user.name || "Your account"}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          {accountLinks(user).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-sunken hover:text-ink focus-visible:bg-sunken"
            >
              {link.label}
            </Link>
          ))}
          <form action={logoutAction} className="mt-1 border-t border-line pt-1">
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-sm text-ink-soft hover:bg-sunken hover:text-ink focus-visible:bg-sunken"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
