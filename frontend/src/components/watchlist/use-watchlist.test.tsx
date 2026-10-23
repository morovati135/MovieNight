import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { movie } from "@/test/fixtures";

import { useWatchlist } from "./use-watchlist";

const api = vi.hoisted(() => ({
  addToWatchlist: vi.fn(),
  getWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
}));

vi.mock("@/lib/api/watchlist", () => api);

beforeEach(() => {
  api.addToWatchlist.mockReset().mockResolvedValue(undefined);
  api.removeFromWatchlist.mockReset().mockResolvedValue(undefined);
  api.getWatchlist.mockReset().mockResolvedValue([movie(1), movie(2)]);
});

describe("useWatchlist", () => {
  it("loads the list and exposes the saved ids", async () => {
    const { result } = renderHook(() => useWatchlist());

    expect(result.current.watchlist.status).toBe("loading");
    await waitFor(() => expect(result.current.watchlist.status).toBe("ready"));
    expect([...result.current.savedMovieIds]).toEqual([1, 2]);
  });

  it("reports an error state when loading fails and recovers on retry", async () => {
    api.getWatchlist.mockRejectedValueOnce(new Error("down"));
    const { result } = renderHook(() => useWatchlist());

    await waitFor(() => expect(result.current.watchlist.status).toBe("error"));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.watchlist.status).toBe("ready"));
  });

  it("adds an unsaved movie to the front and announces it", async () => {
    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.watchlist.status).toBe("ready"));

    let saved = false;
    await act(async () => {
      saved = await result.current.toggle(movie(3));
    });

    expect(saved).toBe(true);
    expect(api.addToWatchlist).toHaveBeenCalledWith(3);
    expect([...result.current.savedMovieIds]).toEqual([3, 1, 2]);
    expect(result.current.statusMessage).toBe("Movie 3 added to your watchlist.");
  });

  it("removes a saved movie and announces it", async () => {
    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.watchlist.status).toBe("ready"));

    await act(async () => {
      await result.current.toggle(movie(1));
    });

    expect(api.removeFromWatchlist).toHaveBeenCalledWith(1);
    expect([...result.current.savedMovieIds]).toEqual([2]);
    expect(result.current.statusMessage).toBe("Movie 1 removed from your watchlist.");
  });

  it("leaves the list unchanged and says so when the backend fails", async () => {
    api.addToWatchlist.mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.watchlist.status).toBe("ready"));

    let saved = true;
    await act(async () => {
      saved = await result.current.toggle(movie(3));
    });

    expect(saved).toBe(false);
    expect([...result.current.savedMovieIds]).toEqual([1, 2]);
    expect(result.current.statusMessage).toBe("We couldn't update your watchlist. Please try again.");
    expect(result.current.updatingMovieIds.size).toBe(0);
  });

  it("ignores a second toggle of a movie that is still updating", async () => {
    let finish: () => void = () => {};
    api.addToWatchlist.mockImplementation(() => new Promise<void>((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.watchlist.status).toBe("ready"));

    let first: Promise<boolean> = Promise.resolve(false);
    act(() => {
      first = result.current.toggle(movie(3));
    });
    await waitFor(() => expect(result.current.updatingMovieIds.has(3)).toBe(true));
    let second = true;
    await act(async () => {
      second = await result.current.toggle(movie(3));
    });
    await act(async () => {
      finish();
      await first;
    });

    expect(second).toBe(false);
    expect(api.addToWatchlist).toHaveBeenCalledTimes(1);
  });

  it("rehydrates from the backend when the saved state was unknown", async () => {
    api.getWatchlist.mockRejectedValueOnce(new Error("down")).mockResolvedValue([movie(3)]);
    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.watchlist.status).toBe("error"));

    await act(async () => {
      await result.current.toggle(movie(3));
    });

    await waitFor(() => expect(result.current.watchlist.status).toBe("ready"));
    expect(api.getWatchlist).toHaveBeenCalledTimes(2);
  });
});
