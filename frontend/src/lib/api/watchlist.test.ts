import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { jsonResponse, movie } from "@/test/fixtures";

import { addToWatchlist, getWatchlist, removeFromWatchlist } from "./watchlist";

const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("watchlist API client", () => {
  it("goes through the same-origin /backend proxy and always sends the cookie", async () => {
    fetchMock.mockImplementation(async () => new Response(JSON.stringify([movie(1)]), { status: 200 }));

    await getWatchlist();
    await addToWatchlist(7);
    await removeFromWatchlist(7);

    expect(fetchMock.mock.calls).toEqual([
      ["/backend/watchlist", { credentials: "include" }],
      ["/backend/watchlist/7", { credentials: "include", method: "POST" }],
      ["/backend/watchlist/7", { credentials: "include", method: "DELETE" }],
    ]);
  });

  it("returns the movies of the list", async () => {
    fetchMock.mockResolvedValue(jsonResponse([movie(1), movie(2)]));

    expect((await getWatchlist()).map((saved) => saved.id)).toEqual([1, 2]);
  });

  it.each([
    [() => getWatchlist(), "Your watchlist could not be loaded."],
    [() => addToWatchlist(1), "This movie could not be saved."],
    [() => removeFromWatchlist(1), "This movie could not be removed."],
  ])("fails with a friendly message when the backend errors", async (call, message) => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 502, title: "raw detail" }, 502));

    await expect(call()).rejects.toThrow(message);
  });
});
