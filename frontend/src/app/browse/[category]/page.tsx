import type { Metadata } from "next";

import { BrowseExperience } from "@/components/browse/browse-experience";

export const metadata: Metadata = {
  title: "Browse · MovieNight",
};

export default async function BrowsePage({ params }: PageProps<"/browse/[category]">) {
  const { category } = await params;

  return <BrowseExperience category={category} />;
}
