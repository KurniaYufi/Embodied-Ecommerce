"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Drawer from "./Drawer";
import { MenuIcon } from "./Icons";
import { logoutAction } from "@/app/actions/logout";
import { accountLinks, type HeaderUser } from "./AccountMenu";
import type { NavItem } from "./SiteHeader";

export default function MobileNav({ links, user }: { links: NavItem[]; user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="icon-btn -ml-2">
        <MenuIcon />
      </button>

      <Drawer open={open} onClose={close} title="Menu" side="left" widthClass="w-[88%] max-w-sm">
        <nav aria-label="Mobile" className="px-5 py-4">
          <ul className="divide-y divide-line">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={close} className="flex items-center justify-between py-4 font-serif text-2xl text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#studio" onClick={close} className="flex py-4 font-serif text-2xl text-ink">
                Our Story
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-2 border-t border-line px-5 py-6">
          {user ? (
            <>
              <p className="eyebrow">Signed in as</p>
              <p className="mt-1 truncate text-sm text-ink">{user.email}</p>
              <ul className="mt-4 space-y-1">
                {accountLinks(user).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={close} className="block py-2 text-[15px] text-ink-soft hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <form action={logoutAction} className="mt-4">
                <button type="submit" className="btn btn-quiet btn-sm w-full">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} onClick={close} className="btn btn-primary btn-sm">
                Log in
              </Link>
              <Link href="/register" onClick={close} className="btn btn-secondary btn-sm">
                Sign up
              </Link>
            </div>
          )}
          <Link href="/help" onClick={close} className="mt-6 block text-sm text-muted hover:text-ink">
            Help &amp; contact
          </Link>
        </div>
      </Drawer>
    </>
  );
}
