# End-to-end checks

Two scripts drive a real headless browser (Edge or Chrome, over the DevTools Protocol, no extra dependencies) through the running application. They need Node 22+ and use **live TMDB data**, so they are run by hand, not as part of `npm test`.

| Script | Command | What it checks |
|---|---|---|
| `journeys.mjs` | `npm run e2e` | The user journeys: Home, save to Watchlist, Details, Search, Pick for Me, remove / undo, friendly errors with the backend blocked, not-found pages, and that the browser never calls `api.themoviedb.org`. |
| `sweep.mjs` | `npm run e2e:sweep` | All 13 routes at 320, 390, 768 and 1440 px: no horizontal overflow, exactly one `h1`, no broken visible images, no touch target under 40 px, no console errors or failed requests (except expected 404 pages). |

| `a11y.mjs` | `npm run e2e:a11y` | axe-core (WCAG 2.1 A / AA and best-practice rules) on 11 routes at 320, 390 and 1440 px, a keyboard Tab pass (skip link first, accessible names, visible focus) on five routes, and page metadata (title, description, social image). |
| `perf.mjs` | `npm run e2e:perf` | Page-load numbers on a production build: FCP, LCP, layout shift, image requests and bytes, failed images. |

All exit with code 1 when something fails.

## Run them

1. Backend with a TMDB token configured: `dotnet run --project backend/MovieNight.Api --launch-profile http` (port 5080).
2. Frontend: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5080 npm run dev` (port 3000). Use `npm run build && npm start` for production-like numbers.
3. `npm run e2e` and `npm run e2e:sweep`.

The Watchlist journey saves and removes one movie in a fresh browser profile, so it leaves nothing behind.

## Settings (environment variables)

- `E2E_BASE_URL` (default `http://localhost:3000`), `E2E_API_URL` (default `http://localhost:5080`; the "backend down" step blocks this address)
- `E2E_ROUTES`: run the sweep for only some routes, e.g. `home,details`
- `BROWSER_PATH`: a Chromium-based browser if Edge / Chrome are not in the usual place
- `E2E_SHOTS_DIR`: where screenshots go (default: the system temp folder)
