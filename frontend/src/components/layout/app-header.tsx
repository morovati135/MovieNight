"use client";

import { useRef } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Clapperboard, Search } from "lucide-react";

import { cn } from "@/lib/utils";

import { isActivePath, navigationItems } from "./navigation-items";
import { NavPill, useActiveBox } from "./nav-pill";

export function AppHeader() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const activeHref = navigationItems.find((item) => isActivePath(pathname, item.href))?.href ?? "";
  const pill = useActiveBox(navRef, activeHref);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-40 px-4 sm:top-6 sm:px-8">
      <div className="pointer-events-auto mx-auto flex h-14 w-full max-w-[77rem] items-center justify-between gap-4 rounded-[1.4rem] bg-[#061126]/72 px-3 shadow-[inset_0_1px_0_rgb(255_255_255/7%),0_18px_50px_rgb(0_0_0/30%)] backdrop-blur-xl sm:h-[4.6rem] sm:rounded-[2rem] sm:px-4 lg:px-5">
        <Link
          aria-label="MovieNight home"
          className="group inline-flex min-h-11 items-center gap-2.5 rounded-full pr-2 pl-1 text-[1.05rem] font-extrabold tracking-[-0.04em] text-white outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#061126]"
          href="/"
        >
          <span className="flex size-8 items-center justify-center rounded-[0.7rem] bg-accent text-accent-foreground shadow-[0_0_24px_rgb(41_187_244/28%)] sm:size-9">
            <Clapperboard aria-hidden="true" className="size-[1.15rem]" />
          </span>
          <span>MovieNight</span>
        </Link>

        <nav aria-label="Primary navigation" className="relative hidden items-center gap-0.5 md:flex lg:gap-1" ref={navRef}>
          <NavPill box={pill} />
          {navigationItems.map(({ href, icon: Icon, label, shortLabel }) => {
            const isActive = href === activeHref;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group/nav relative z-10 inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-[0.95rem] lg:px-4 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "text-white" : "text-white/62 hover:bg-white/[0.05] hover:text-white",
                )}
                href={href}
                key={href}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-[1.05rem] transition-[color,transform] duration-200",
                    isActive ? "text-[#7fd8ff]" : "group-hover/nav:-translate-y-px motion-reduce:transform-none",
                  )}
                />
                {/* Tablets get the short labels so the four items fit beside the logo and search. */}
                <span className="lg:hidden">{shortLabel}</span>
                <span className="hidden lg:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          aria-label="Search movies"
          className="inline-flex size-11 items-center justify-center rounded-full text-white/82 outline-none transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#061126]"
          href="/?search=open"
        >
          <Search aria-hidden="true" className="size-5" />
        </Link>
      </div>
    </header>
  );
}
