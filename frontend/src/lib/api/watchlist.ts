import type { MovieSummary } from "@/types/movie";

const credentials: RequestCredentials = "include";

export async function getWatchlist(): Promise<MovieSummary[]> {
  const response = await fetch("/backend/watchlist", { credentials });

  if (!response.ok) {
    throw new Error("Your watchlist could not be loaded.");
  }

  return (await response.json()) as MovieSummary[];
}

export async function addToWatchlist(movieId: number): Promise<void> {
  const response = await fetch(`/backend/watchlist/${movieId}`, {
    method: "POST",
    credentials,
  });

  if (!response.ok) {
    throw new Error("This movie could not be saved.");
  }
}

export async function removeFromWatchlist(movieId: number): Promise<void> {
  const response = await fetch(`/backend/watchlist/${movieId}`, {
    method: "DELETE",
    credentials,
  });

  if (!response.ok) {
    throw new Error("This movie could not be removed.");
  }
}
