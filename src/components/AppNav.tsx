"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Dashboard", exact: true },
  { href: "/app/artists", label: "Artist Finder", exact: false },
  { href: "/app/add", label: "Add Concert", exact: false },
  { href: "/app/concerts", label: "My Concerts", exact: false },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="max-w-6xl mx-auto px-4 py-3">
      <div role="tablist" className="tabs tabs-boxed bg-base-200 p-1 flex flex-wrap gap-1">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              role="tab"
              className={`tab flex-1 sm:flex-none ${active ? "tab-active" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
