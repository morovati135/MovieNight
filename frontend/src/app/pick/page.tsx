import { Suspense } from "react";

import type { Metadata } from "next";

import { PickExperience } from "@/components/pick/pick-experience";

export const metadata: Metadata = {
  title: "Pick for Me · MovieNight",
};

export default function PickPage() {
  // The picker reads its filters from the URL, which is only known in the browser.
  return (
    <Suspense>
      <PickExperience />
    </Suspense>
  );
}
