import Link from "next/link";

import { Search } from "lucide-react";

import { PageContainer } from "./page-container";

const navigation = [
  { href: "/", label: "Discover" },
  { href: "/pick", label: "Pick for Me" },
  { href: "/watchlist", label: "Watchlist" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/75 backdrop-blur-xl">
      <PageContainer className="flex h-18 items-center justify-between gap-6">
        <Link
          className="group inline-flex items-center gap-2.5 rounded-lg text-lg font-extrabold tracking-[-0.04em] text-foreground outline-none transition-opacity duration-200 ease-out hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          href="/"
        >
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full bg-accent shadow-[0_0_18px_color-mix(in_oklch,var(--accent),transparent_25%)]"
          />
          MovieNight
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 ease-out hover:bg-white/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          aria-label="Search movies"
          className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 ease-out hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="/"
        >
          <Search />
        </Link>
      </PageContainer>
    </header>
  );
}
