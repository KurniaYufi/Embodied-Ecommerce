"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { NavItem } from "./SiteHeader";

function isActive(href: string, pathname: string, search: URLSearchParams): boolean {
  const [path, query] = href.split("?");
  if (path.includes("#")) return false;
  if (pathname !== path) return false;
  const wanted = new URLSearchParams(query ?? "");
  const category = search.get("category") ?? "";
  return (wanted.get("category") ?? "") === category;
}

function Links({ links }: { links: NavItem[] }) {
  const pathname = usePathname();
  const search = useSearchParams();

  return (
    <>
      {links.map((link) => {
        const active = isActive(link.href, pathname, search);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-2 text-[12px] font-medium tracking-[0.14em] uppercase transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-ink after:transition-transform after:duration-300 group-data-[tone=light]/header:after:bg-white ${
              active
                ? "text-ink after:scale-x-100 group-data-[tone=light]/header:text-white"
                : "text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100 group-data-[tone=light]/header:text-white/80 group-data-[tone=light]/header:hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export default function NavLinks({ links }: { links: NavItem[] }) {
  return (
    <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-9">
      <Suspense
        fallback={links.map((l) => (
          <Link key={l.href} href={l.href} className="py-2 text-[12px] font-medium tracking-[0.14em] text-muted uppercase group-data-[tone=light]/header:text-white/80">
            {l.label}
          </Link>
        ))}
      >
        <Links links={links} />
      </Suspense>
    </nav>
  );
}
