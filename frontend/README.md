# MovieNight Frontend

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. It talks only to the MovieNight API. Full setup is in the [root README](../README.md).

## Commands

```bash
cp .env.example .env.local     # NEXT_PUBLIC_API_BASE_URL=http://localhost:5080
npm ci
npm run dev                    # http://localhost:3000
npm run build && npm start     # production build
npm run typecheck && npx eslint && npm test
```

Browser scripts (need both servers; see [e2e/README.md](e2e/README.md)): `npm run e2e`, `npm run e2e:sweep`, `npm run e2e:a11y`, `npm run e2e:perf`.

## Layout

- `src/app/` routes: `/`, `/movies/[id]`, `/pick`, `/watchlist`, `/about`, `/browse/[category]`.
- `src/components/` by feature (`home`, `movie`, `movie-details`, `search`, `pick`, `watchlist`, `layout`, `ui`).
- `src/lib/api/` is the only code that calls the backend; `src/types/` mirrors the API (checked against `../contracts/api-shapes.json`).

## Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | backend address; also enables the same-origin `/backend` Watchlist proxy (read at dev start / build time) |
| `NEXT_PUBLIC_SITE_URL` | public address used for social-preview metadata (optional) |

These are visible to every browser: never put secrets in them.
