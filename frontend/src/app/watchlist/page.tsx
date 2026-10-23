import type { Metadata } from "next";

import { WatchlistExperience } from "@/components/watchlist/watchlist-experience";

export const metadata: Metadata = {
  title: "Watchlist",
};

export default function WatchlistPage() {
  return <WatchlistExperience />;
}
