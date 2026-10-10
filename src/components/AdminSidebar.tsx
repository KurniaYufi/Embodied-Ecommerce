"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButtonClientForm from "./LogoutButtonClientForm";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Products", href: "/seller/products", group: "Master Data" },
  { label: "Categories", href: "/seller/categories", group: "Master Data" },
  { label: "Transactions", href: "/seller/transactions" },
  { label: "Payment Methods", href: "/seller/payment-methods" },
];

export default function AdminSidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-4 text-sm">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`px-3 py-2 ${
            pathname === item.href || pathname.startsWith(item.href + "/")
              ? "bg-neutral-900 text-white"
              : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 lg:hidden dark:border-neutral-800">
        <Link href="/dashboard" className="text-xs font-medium tracking-[0.25em] uppercase">
          Embodied
        </Link>
        <button type="button" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
      </div>

      {mobileOpen && <div className="border-b border-neutral-200 lg:hidden dark:border-neutral-800">{nav}</div>}

      <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-neutral-200 lg:flex dark:border-neutral-800">
        <Link href="/dashboard" className="px-6 py-6 text-xs font-medium tracking-[0.25em] uppercase">
          Embodied
        </Link>
        {nav}
        <div className="border-t border-neutral-200 p-4 text-xs dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">{userName}</p>
          <p className="text-neutral-500">{userEmail}</p>
          <LogoutButtonClientForm />
        </div>
      </aside>
    </>
  );
}
