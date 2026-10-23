import Link from "next/link";

import { ArrowUpRight, Bookmark, Compass, Info, Sparkles } from "lucide-react";

import { GitHubIcon, InstagramIcon, XIcon } from "@/components/ui/brand-icons";

const features = [
  {
    description: "Trending and popular movies, genres, and search with genre, year and rating filters.",
    href: "/",
    icon: Compass,
    title: "Discover",
  },
  {
    description: "Choose a genre, a year and a rating, or leave them open, and get one popular movie that fits.",
    href: "/pick",
    icon: Sparkles,
    title: "Pick for Me",
  },
  {
    description: "Save movies for later. Your Watchlist lives in this browser only, with no account needed.",
    href: "/watchlist",
    icon: Bookmark,
    title: "Watchlist",
  },
];

const stack = ["Next.js", "React", "TypeScript", "Tailwind CSS", "ASP.NET Core", ".NET 10", "EF Core + SQLite", "TMDB API"];

const socials = [
  { handle: "@morovati135", href: "https://github.com/morovati135", icon: GitHubIcon, name: "GitHub" },
  { handle: "@AmirMahdi_Salar", href: "https://x.com/AmirMahdi_Salar", icon: XIcon, name: "X" },
  { handle: "@morovati135", href: "https://www.instagram.com/morovati135", icon: InstagramIcon, name: "Instagram" },
];

const sectionTitleClassName = "text-xl font-extrabold tracking-[-0.03em] text-white sm:text-2xl";
const panelClassName = "rounded-[1.5rem] bg-white/[0.04] shadow-[inset_0_1px_0_rgb(255_255_255/5%)]";

export function AboutExperience() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[64rem] px-5 pt-28 pb-16 sm:px-8 md:pt-36 lg:pb-24">
        <header className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-white/80 uppercase sm:text-[0.8125rem]">
            <Info aria-hidden="true" className="size-3.5" />
            About
          </p>
          <h1 className="mt-4 text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.05em] text-white sm:text-6xl">
            Made for movie nights.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            MovieNight is a portfolio and practice project, designed and developed by{" "}
            <span className="font-bold text-white">Amir Mahdi Morovati</span>. It brings together discovering movies, letting the
            app pick one for tonight, and keeping a private watchlist, with no account needed.
          </p>
        </header>

        <section aria-labelledby="about-features" className="mt-14 sm:mt-16">
          <h2 className={sectionTitleClassName} id="about-features">
            What’s inside
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {features.map(({ description, href, icon: Icon, title }) => (
              <li key={href}>
                <Link
                  className={`${panelClassName} flex h-full flex-col p-5 outline-none transition-colors hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-ring`}
                  href={href}
                >
                  <Icon aria-hidden="true" className="size-5 text-accent" />
                  <span className="mt-3 text-base font-extrabold text-white">{title}</span>
                  <span className="mt-1.5 text-sm leading-6 text-white/65">{description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="about-stack" className="mt-14 sm:mt-16">
          <h2 className={sectionTitleClassName} id="about-stack">
            How it’s built
          </h2>
          <div className="mt-3 max-w-2xl space-y-3 text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
            <p>
              MovieNight is also a practice in building software with an AI coding agent, using spec-driven development. Every
              stage starts as a written spec in the repository, with its scope, decisions and acceptance checks. The agent builds
              one small work package at a time, and each one is reviewed in the browser before the next begins.
            </p>
            <p>
              A Next.js frontend talks only to an ASP.NET Core backend. The backend fetches movie data from TMDB and keeps each
              browser’s Watchlist in its own database.
            </p>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {stack.map((item) => (
              <li className="rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="about-socials" className="mt-14 sm:mt-16">
          <h2 className={sectionTitleClassName} id="about-socials">
            Find me online
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {socials.map(({ handle, href, icon: Icon, name }) => (
              <li key={name}>
                <a
                  className={`${panelClassName} group flex min-h-11 items-center gap-4 p-4 outline-none transition-[background-color,transform,box-shadow] duration-300 ease-out hover:bg-white/[0.07] hover:shadow-[inset_0_1px_0_rgb(255_255_255/8%),0_18px_40px_rgb(0_0_0/45%),0_0_0_1px_rgb(56_189_248/14%)] focus-visible:ring-2 focus-visible:ring-ring motion-safe:hover:-translate-y-1.5`}
                  href={href}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="size-5 shrink-0 text-white" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-extrabold text-white">{name}</span>
                    <span className="block truncate text-sm text-white/60">{handle}</span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-white/45 transition-[color,transform] duration-300 group-hover:text-white motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
