import { Suspense } from "react";

import { HomeExperience } from "@/components/home/home-experience";
import { HomeLoading } from "@/components/home/home-states";

export default function Home() {
  // Home reads the Search state from the URL, which is only known in the browser.
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeExperience />
    </Suspense>
  );
}
