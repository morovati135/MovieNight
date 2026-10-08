import Link from "next/link";

import { ArrowRight } from "lucide-react";

const pickPreferences = ["Genre", "Release year", "Min. rating"];

export function PickForMeCta() {
  return (
    <section aria-labelledby="pick-for-me-heading" className="pick-glow relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[6%] inset-y-6 -z-10 rounded-[2rem] bg-[linear-gradient(100deg,rgb(35_177_247/30%),rgb(92_112_255/14%)_55%,rgb(232_76_157/24%))] opacity-55 blur-3xl"
      />
      <div aria-hidden="true" className="pick-glow-layer pick-glow-halo -z-10">
        <div className="pick-glow-notched">
          <div className="pick-glow-ring">
            <span className="pick-glow-spot" />
          </div>
        </div>
      </div>

      <div className="pick-ticket relative flex flex-col overflow-hidden rounded-[1.75rem] bg-[#071429] shadow-[0_30px_80px_rgb(0_0_0/38%)] md:min-h-[22rem] md:flex-row lg:min-h-[26rem] lg:rounded-[2rem]">
        <div className="relative flex flex-1 items-center overflow-hidden px-6 pt-10 pb-11 sm:px-10 sm:pt-12 sm:pb-12 lg:px-16 lg:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_0%_100%,rgb(26_120_214/18%),transparent_70%),linear-gradient(115deg,#071429_0%,#0a1d3f_62%,#081631_100%)]"
          />
          <div
            aria-hidden="true"
            className="pick-ticket-beam pointer-events-none absolute inset-0"
          >
            <div className="absolute -top-10 left-[40%] h-[130%] w-[75%] blur-2xl sm:left-[46%] md:left-[40%] md:w-[62%] lg:left-[46%] lg:w-[48%]">
              <div className="size-full bg-[linear-gradient(to_bottom,rgb(140_222_255/36%),rgb(80_160_255/12%)_52%,transparent_86%)] [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)]" />
            </div>
            <div className="absolute -top-8 left-[calc(40%+25%)] size-28 -translate-x-1/2 rounded-full bg-[#9fe0ff]/18 blur-2xl sm:left-[calc(46%+25%)] md:left-[calc(40%+31%)] lg:left-[calc(46%+24%)]" />
            <div className="absolute -bottom-20 left-[calc(40%+25%)] hidden h-44 w-[30rem] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgb(70_170_255/24%),rgb(232_76_157/8%)_55%,transparent_72%)] blur-xl md:left-[calc(40%+31%)] md:block lg:left-[calc(46%+24%)]" />
          </div>
          <div aria-hidden="true" className="pick-ticket-grain pointer-events-none absolute inset-0" />

          <div className="relative z-10 max-w-[34rem]">
            <p className="flex items-center gap-3 text-xs font-bold tracking-[0.22em] text-[#7fd8ff] uppercase sm:text-[0.8125rem]">
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-[#7fd8ff]/0 to-[#7fd8ff]" />
              Movie night, sorted
            </p>
            <h2
              className="mt-4 text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-white sm:mt-5 sm:text-[2.875rem] lg:text-[4.25rem]"
              id="pick-for-me-heading"
            >
              <span className="block">Can&apos;t decide?</span>
              <span className="block bg-[linear-gradient(95deg,#ffffff_8%,#a6e3ff_55%,#f5a9d1_100%)] bg-clip-text pb-1 text-transparent">
                We&apos;ll pick one.
              </span>
            </h2>
            <p className="mt-4 max-w-[30rem] text-sm leading-6 text-white/72 sm:mt-5 sm:text-base sm:leading-7">
              Choose a genre, a release year and a minimum rating, or leave them open.
              MovieNight picks one movie for tonight.
            </p>
            <Link
              className="group mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1aa8ef] px-7 text-sm font-bold text-white shadow-[0_12px_34px_rgb(26_168_239/30%)] outline-none transition-[background-color,box-shadow] hover:bg-[#39baff] hover:shadow-[0_14px_40px_rgb(26_168_239/42%)] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#071429] sm:mt-8"
              href="/pick"
            >
              Pick for Me
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative flex h-[9.5rem] shrink-0 flex-col justify-center border-t-2 border-dashed border-white/[0.14] bg-[radial-gradient(ellipse_90%_80%_at_100%_100%,rgb(232_76_157/17%),transparent_70%),linear-gradient(180deg,#0a1a38,#081530)] px-6 sm:px-10 md:h-auto md:w-60 md:border-t-0 md:border-l-2 md:px-8 lg:w-[21rem] lg:px-12"
        >
          <div className="pick-ticket-grain pointer-events-none absolute inset-0" />
          <p className="relative z-10 text-[0.6875rem] font-bold tracking-[0.28em] text-[#7fd8ff]/80 uppercase">
            Tonight&apos;s ticket
          </p>
          <p className="relative z-10 mt-1.5 text-[2rem] leading-[0.95] font-extrabold tracking-[-0.02em] text-white/92 uppercase md:mt-4 md:text-[2.5rem] lg:text-[3.25rem]">
            <span className="md:block">Admit</span> <span className="md:block">one</span>
          </p>
          <ul className="relative z-10 mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.6875rem] font-semibold tracking-[0.16em] text-white/50 uppercase md:mt-6 md:flex-col">
            {pickPreferences.map((preference) => (
              <li className="flex items-center gap-2" key={preference}>
                <span className="size-1 rounded-full bg-[#e84c9d]/80" />
                {preference}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true" className="pick-glow-layer pick-glow-bleed">
          <div className="pick-glow-ring">
            <span className="pick-glow-spot" />
          </div>
        </div>
        <div aria-hidden="true" className="pick-ticket-frame">
          <span className="pick-glow-spot" />
        </div>
      </div>

      <div aria-hidden="true" className="pick-glow-layer pick-glow-core">
        <div className="pick-glow-notched">
          <div className="pick-glow-ring">
            <span className="pick-glow-spot" />
          </div>
        </div>
      </div>
    </section>
  );
}
