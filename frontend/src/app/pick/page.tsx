import { Suspense } from "react";

import type { Metadata } from "next";

import { PickExperience } from "@/components/pick/pick-experience";

export const metadata: Metadata = {
  title: "Pick for Me",
};

export default function PickPage() {
  // The picker reads its filters from the URL, which is only known in the browser. The fallback is as tall as
  // the page, so the footer starts below the fold instead of jumping down when the page appears.
  return (
    <Suspense fallback={<div aria-hidden="true" className="min-h-svh flex-1" />}>
      <PickExperience />
    </Suspense>
  );
}
