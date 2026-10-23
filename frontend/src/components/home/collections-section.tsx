"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { sectionTitleClassName } from "@/components/layout/section-heading";
import { useRailScroll } from "@/components/movie/use-rail-scroll";
import { glassControlClassName } from "@/components/ui/controls";
import { ResilientImage } from "@/components/ui/resilient-image";
import { getCollections } from "@/lib/api/movies";
import { cn } from "@/lib/utils";
import type { MovieCollection } from "@/types/movie";

import { SectionNotice } from "./home-states";
import { useNearViewport } from "./use-near-viewport";

type CollectionsState = { status: "loading" } | { status: "error" } | { status: "ready"; collections: MovieCollection[] };

// Two columns on phones (`movie-covers/Collection_Mobile`), a horizontal rail from tablets up (`movie-covers/Collections`).
const trackClassName =
  "grid grid-cols-2 gap-x-5 gap-y-9 px-1 pb-8 sm:w-max sm:auto-cols-[13rem] sm:grid-flow-col sm:grid-cols-none sm:gap-x-6 sm:px-8 lg:auto-cols-[15.5rem] lg:gap-x-7 lg:px-0";

/**
 * A collection as a small stack of posters: the first film in front, the next two peeking out behind it
 * to the right and below, with the collection name over the front poster.
 */
function CollectionStack({ collection }: { collection: MovieCollection }) {
  const [front, ...back] = collection.posterUrls;

  return (
    <Link
      className="group relative block rounded-2xl pr-[24%] pb-[12%] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      href={`/browse/${collection.slug}`}
    >
      {back
        .slice(0, 2)
        .reverse()
        .map((url, reverseIndex) => {
          const depth = back.slice(0, 2).length - reverseIndex;

          return (
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 overflow-hidden rounded-2xl bg-white/6 shadow-[0_16px_34px_rgb(0_0_0/45%)] transition-transform duration-300 ease-out motion-reduce:transition-none",
                depth === 1
                  ? "translate-x-[15%] translate-y-[5%] scale-[0.95] group-hover:translate-x-[18%] group-hover:translate-y-[6%]"
                  : "translate-x-[29%] translate-y-[10%] scale-[0.9] group-hover:translate-x-[34%] group-hover:translate-y-[12%]",
              )}
              key={url}
              style={{ right: "24%", bottom: "12%" }}
            >
              <ResilientImage alt="" className="object-cover brightness-[0.85] saturate-[1.1]" fill sizes="(max-width: 639px) 40vw, 224px" src={url} />
            </div>
          );
        })}
      <div className="relative aspect-[7/10] overflow-hidden rounded-2xl bg-white/6 shadow-[0_22px_44px_rgb(0_0_0/55%)] ring-1 ring-white/10">
        {front ? (
          <ResilientImage
            alt=""
            className="object-cover brightness-[0.78] transition-[filter] duration-300 group-hover:brightness-90"
            fill
            sizes="(max-width: 639px) 40vw, 224px"
            src={front}
          />
        ) : null}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/20" />
        <h3
          className="absolute inset-0 flex items-center justify-center px-3 text-center text-[1.6rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance text-white [text-shadow:0_1px_2px_rgb(0_0_0/45%),0_2px_10px_rgb(0_0_0/40%)] sm:text-[1.85rem] lg:text-[2.15rem]"
        >
          {collection.title}
        </h3>
      </div>
    </Link>
  );
}

export function CollectionsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const isNear = useNearViewport(sectionRef);
  const [state, setState] = useState<CollectionsState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const collections = state.status === "ready" ? state.collections : [];
  const { canScrollNext, canScrollPrevious, scrollRail, updateScrollState } = useRailScroll(railRef, collections.length);

  useEffect(() => {
    if (!isNear) {
      return;
    }

    let isCurrent = true;

    getCollections()
      .then((result) => isCurrent && setState({ collections: result, status: "ready" }))
      .catch(() => isCurrent && setState({ status: "error" }));

    return () => {
      isCurrent = false;
    };
  }, [attempt, isNear]);

  if (state.status === "ready" && collections.length === 0) {
    return null;
  }

  return (
    <section aria-busy={state.status === "loading"} aria-labelledby="collections-heading" className="relative isolate" ref={sectionRef}>
      <div className="mb-5 flex min-h-11 items-center sm:mb-8">
        <h2 className={sectionTitleClassName} id="collections-heading">
          Collections
        </h2>
      </div>

      {state.status === "error" ? (
        <SectionNotice
          onAction={() => {
            setState({ status: "loading" });
            setAttempt((current) => current + 1);
          }}
        >
          Collections could not be loaded right now.
        </SectionNotice>
      ) : (
        <div className="relative">
          <div
            aria-label="Collections"
            className="overflow-visible outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:-mx-8 sm:overflow-x-auto sm:overscroll-x-contain sm:[scrollbar-width:none] lg:mx-0 [&::-webkit-scrollbar]:hidden"
            onScroll={updateScrollState}
            ref={railRef}
            role="region"
            tabIndex={0}
          >
            <ul className={trackClassName}>
              {state.status === "loading"
                ? Array.from({ length: 6 }, (_, index) => (
                    <li aria-hidden="true" className="pr-[24%] pb-[12%]" key={index}>
                      <div className="aspect-[7/10] rounded-2xl bg-white/7 motion-safe:animate-pulse" />
                    </li>
                  ))
                : collections.map((collection) => (
                    <li key={collection.slug}>
                      <CollectionStack collection={collection} />
                    </li>
                  ))}
            </ul>
          </div>

          <button
            aria-label="Previous collections"
            className={cn(glassControlClassName, "absolute top-[42%] left-1 z-20 hidden -translate-y-1/2 shadow-[0_10px_28px_rgb(0_0_0/32%)] md:flex lg:-left-5")}
            disabled={!canScrollPrevious}
            onClick={() => scrollRail(-1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            aria-label="Next collections"
            className={cn(glassControlClassName, "absolute top-[42%] right-1 z-20 hidden -translate-y-1/2 shadow-[0_10px_28px_rgb(0_0_0/32%)] md:flex lg:-right-5")}
            disabled={!canScrollNext}
            onClick={() => scrollRail(1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      )}
    </section>
  );
}
