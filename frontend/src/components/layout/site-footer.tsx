import Image from "next/image";
import Link from "next/link";

import { Clapperboard, Heart } from "lucide-react";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/about", label: "About" },
];

const linkClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-1 text-sm font-semibold text-white/65 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring";

/** Site footer: navigation, the TMDB attribution required by TMDB's API terms, and the maker's credit (D030). */
export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#020818]/60 pb-24 md:pb-0">
      <div className="mx-auto grid w-full max-w-[77rem] gap-8 px-5 pt-10 pb-8 sm:px-8 md:grid-cols-[1fr_auto] md:gap-12 lg:px-12">
        <div>
          <Link
            aria-label="MovieNight home"
            className="inline-flex min-h-11 items-center gap-2.5 rounded-lg text-[1.05rem] font-extrabold tracking-[-0.04em] text-white outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Clapperboard aria-hidden="true" className="size-[1.15rem]" />
            </span>
            MovieNight
          </Link>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/55">Discover, pick and save movies for your next movie night.</p>
          <nav aria-label="Footer navigation" className="mt-4">
            <ul className="-ml-1 flex flex-wrap gap-x-4">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link className={linkClassName} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="max-w-xs text-left">
          <a
            aria-label="The Movie Database (TMDB)"
            className="inline-flex min-h-11 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="https://www.themoviedb.org/"
            rel="noreferrer"
            target="_blank"
          >
            <Image alt="" height={14} src="/tmdb-logo.svg" width={108} />
          </a>
          <p className="mt-2 text-xs leading-5 text-white/50">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[77rem] flex-col items-start justify-between gap-1 border-t border-white/6 px-5 py-4 text-xs text-white/60 sm:flex-row sm:items-center sm:px-8 lg:px-12">
        <p>© {new Date().getFullYear()} MovieNight</p>
        <p className="inline-flex items-center gap-1.5">
          Made with <Heart aria-label="love" className="size-3.5 fill-brand-pink text-brand-pink" role="img" /> by
          <a
            className="inline-flex min-h-11 items-center rounded font-semibold text-white/70 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
            href="https://x.com/AmirMahdi_Salar"
            rel="noreferrer"
            target="_blank"
          >
            Amir Mahdi
          </a>
        </p>
      </div>
    </footer>
  );
}
