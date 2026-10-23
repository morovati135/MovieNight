import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { page } from "@/test/fixtures";

import { BrowseExperience } from "./browse-experience";

const api = vi.hoisted(() => {
  class MovieNotFoundError extends Error {}

  return {
    getCollectionMovies: vi.fn(),
    getCollections: vi.fn(),
    getPopularMovies: vi.fn(),
    getTopRatedMovies: vi.fn(),
    getTrendingMovies: vi.fn(),
    MovieNotFoundError,
  };
});

vi.mock("@/lib/api/movies", () => api);
vi.mock("@/lib/api/watchlist", () => ({
  addToWatchlist: vi.fn(),
  getWatchlist: vi.fn().mockResolvedValue([]),
  removeFromWatchlist: vi.fn(),
}));

const twoPages = (pageNumber: number) =>
  page(pageNumber === 1 ? [1, 2] : [3, 4], { page: pageNumber, totalPages: 2, totalResults: 4 });

beforeEach(() => {
  for (const mock of [api.getCollectionMovies, api.getCollections, api.getPopularMovies, api.getTopRatedMovies, api.getTrendingMovies]) {
    mock.mockReset();
  }

  api.getCollections.mockResolvedValue([{ posterUrls: [], slug: "marvel", title: "Marvel" }]);
  api.getTrendingMovies.mockImplementation(async (pageNumber: number) => twoPages(pageNumber));
});

describe("BrowseExperience", () => {
  it("shows the first page, then appends the next page on Load more until none is left", async () => {
    const user = userEvent.setup();
    render(<BrowseExperience category="trending" />);

    expect(await screen.findByRole("link", { name: "View details for Movie 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Trending Now");
    expect(screen.getByText("Showing 2 of 4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load more" }));

    expect(await screen.findByRole("link", { name: "View details for Movie 4" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details for Movie 1" })).toBeInTheDocument();
    expect(api.getTrendingMovies).toHaveBeenLastCalledWith(2);
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

  it("does not show the same movie twice when TMDB repeats it on the next page", async () => {
    const user = userEvent.setup();
    api.getTrendingMovies.mockImplementation(async (pageNumber: number) =>
      pageNumber === 1
        ? page([1, 2], { totalPages: 2, totalResults: 4 })
        : { ...page([2, 3], { totalPages: 2, totalResults: 4 }), page: 2 },
    );
    render(<BrowseExperience category="trending" />);

    await user.click(await screen.findByRole("button", { name: "Load more" }));
    await screen.findByRole("link", { name: "View details for Movie 3" });

    expect(screen.getAllByRole("link", { name: "View details for Movie 2" })).toHaveLength(1);
  });

  it("keeps the loaded movies and offers Try again when a later page fails", async () => {
    const user = userEvent.setup();
    api.getTrendingMovies.mockImplementation(async (pageNumber: number) => {
      if (pageNumber === 2 && api.getTrendingMovies.mock.calls.length === 2) {
        throw new Error("down");
      }

      return twoPages(pageNumber);
    });
    render(<BrowseExperience category="trending" />);

    await user.click(await screen.findByRole("button", { name: "Load more" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("More movies couldn’t be loaded.");
    expect(screen.getByRole("link", { name: "View details for Movie 1" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("link", { name: "View details for Movie 4" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a friendly error with retry when the first page fails", async () => {
    const user = userEvent.setup();
    api.getTrendingMovies.mockRejectedValueOnce(new Error("down"));
    render(<BrowseExperience category="trending" />);

    expect(await screen.findByText("Movies couldn’t be loaded right now.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try again|retry/i }));

    expect(await screen.findByRole("link", { name: "View details for Movie 1" })).toBeInTheDocument();
  });

  it("shows an empty state when a category has no movies", async () => {
    api.getPopularMovies.mockResolvedValue(page([]));
    render(<BrowseExperience category="popular" />);

    expect(await screen.findByText("There are no movies here yet.")).toBeInTheDocument();
  });

  it("uses the collection title and its movies for a collection slug", async () => {
    api.getCollectionMovies.mockResolvedValue(page([7]));
    render(<BrowseExperience category="marvel" />);

    expect(await screen.findByRole("link", { name: "View details for Movie 7" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Marvel");
    expect(api.getCollectionMovies).toHaveBeenCalledWith("marvel", 1);
  });

  it("says a collection does not exist when the backend answers not found", async () => {
    api.getCollectionMovies.mockRejectedValue(new api.MovieNotFoundError("missing"));
    render(<BrowseExperience category="nope" />);

    expect(await screen.findByText(/This collection doesn’t exist/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Not found");
  });

  it("does not call the backend for a category that cannot be a collection slug", async () => {
    render(<BrowseExperience category="Bad Slug!" />);

    await waitFor(() => expect(screen.getByText(/This collection doesn’t exist/)).toBeInTheDocument());
    expect(api.getCollectionMovies).not.toHaveBeenCalled();
  });

  it("starts over when the category changes", async () => {
    api.getPopularMovies.mockResolvedValue(page([9]));
    const { rerender } = render(<BrowseExperience category="trending" />);
    await screen.findByRole("link", { name: "View details for Movie 1" });

    rerender(<BrowseExperience category="popular" />);

    expect(await screen.findByRole("link", { name: "View details for Movie 9" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View details for Movie 1" })).not.toBeInTheDocument();
  });
});
