"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Security", href: "/settings/security" },
  { label: "Appearance", href: "/settings/appearance" },
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings" className="lg:w-48 lg:shrink-0">
      <ul className="flex gap-1 overflow-x-auto border-b border-line lg:flex-col lg:border-b-0">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px block border-b-2 px-3 py-2.5 text-sm whitespace-nowrap transition-colors lg:mb-0 lg:border-b-0 lg:border-l-2 lg:px-4 ${
                  active ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
