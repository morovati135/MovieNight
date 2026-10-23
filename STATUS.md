# MovieNight — Status

Single source of truth for where the project stands. Keep it short; history lives in Git.

## Current state

- **MovieNight 1.0 is complete.** Stages 00–07 are finished and accepted by the Tech Lead (Stage 07 on 2026-10-24). The application is feature-complete, verified and documented; Stage 07 added no features.
- Stage 07 delivered: performance and loading polish, accessibility / responsive / metadata review, code cleanup and backend structure, documentation / repository hygiene / secrets (README with a TMDB token guide, single-source docs, `CLAUDE.md` as the only agent file, curated images, secret scan, clean-clone check, history cleanup of old screenshots), and final verification.
- Nothing is open. Suggested release: tag `v1.0.0` on `master` after the final pull request is merged.

## Verified at the last full check (fresh clone of the pushed branch, following the README)

| Check | Result |
|---|---|
| Backend tests (`dotnet test backend/MovieNight.slnx`) | 178 passing, 0 warnings |
| Frontend (`typecheck`, `eslint`, `vitest`, `next build`) | clean, 41 tests passing |
| Browser journeys, 13-route responsive sweep | all passing |
| Accessibility audit (axe-core, keyboard, metadata) | no violations |
| Dependencies (`npm audit`, `dotnet list package --vulnerable`) | none known |

## Known limits

- The first-ever load of an image depends on TMDB's image servers (2–7 s when they are slow); later loads use the 30-day optimizer cache.
- No background cache refresh: the first visitor after a cache entry expires waits for one cold TMDB call (D032).
- Not implemented until a hosting decision: Content-Security-Policy, rate limiting, HTTPS redirect and HSTS (D033).
- Frontend component tests cover the API layer, `useWatchlist` and Browse; the rest is covered by the browser scripts, which need live TMDB data and are run by hand.

## How to continue

The project is complete; any further work is new scope that needs a decision first. Read [CLAUDE.md](CLAUDE.md) (agent rules), [PROJECT.md](PROJECT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [DECISIONS.md](DECISIONS.md) and the Stage 07 summary, then work only on the step the Tech Lead names.
