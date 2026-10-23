import type { Metadata } from "next";

import { BrowseExperience } from "@/components/browse/browse-experience";

const categoryTitles: Record<string, string> = {
  iconic: "Iconic: Top rated of all time",
  popular: "Popular Movies",
  trending: "Trending Now",
};

export async function generateMetadata({ params }: PageProps<"/browse/[category]">): Promise<Metadata> {
  const { category } = await params;

  // Collection pages are named by the backend, so they share a generic title.
  return { title: categoryTitles[category] ?? "Collection" };
}

export default async function BrowsePage({ params }: PageProps<"/browse/[category]">) {
  const { category } = await params;

  return <BrowseExperience category={category} />;
}
