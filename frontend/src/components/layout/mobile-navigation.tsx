"use client";

import { useRef } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { isActivePath, navigationItems } from "./navigation-items";
import { NavPill, useActiveBox, useOptimisticActiveHref } from "./nav-pill";

export function MobileNavigation() {
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);
  const routeHref = navigationItems.find((item) => isActivePath(pathname, item.href))?.href ?? "";
  const [activeHref, selectHref] = useOptimisticActiveHref(routeHref, pathname);
  const pill = useActiveBox(listRef, activeHref);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      {/* halo-tabs pill track: fully rounded, frosted, an inner highlight instead of a stroke. */}
      <div
        className="relative mx-auto grid w-full max-w-md grid-cols-4 rounded-full bg-[#061126]/85 p-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/8%),0_0_0_1px_rgb(255_255_255/5%),0_-8px_36px_rgb(0_0_0/45%)] backdrop-blur-xl"
        ref={listRef}
      >
        <NavPill box={pill} />
        {navigationItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === activeHref;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative z-10 flex min-h-[3.25rem] touch-manipulation items-center justify-center rounded-full outline-none [-webkit-tap-highlight-color:transparent] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "text-white" : "text-white/55 hover:text-white",
              )}
              href={href}
              key={href}
              onPointerDown={() => selectHref(href)}
            >
              {/* Icons only on phones; the name stays available to screen readers. */}
              <Icon aria-hidden="true" className={cn("size-6 transition-colors", isActive && "text-[#7fd8ff]")} />
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
