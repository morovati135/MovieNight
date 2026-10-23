# MovieNight — Status

Single source of truth for where the project stands. Keep it short; history lives in Git.

## Current state

- **Stages 00–06 are complete and accepted.** The application is feature-complete and verified.
- **Stage 07 (final polish and portfolio handoff) is in progress.** Done: performance and loading polish, accessibility / responsive / metadata review, code cleanup and backend structure, and documentation / repository hygiene / secrets (awaiting Tech Lead review). Remaining: final verification and handoff (demo notes, release tag).
- Documentation and hygiene delivered: `README.md` with a step-by-step TMDB token guide and local setup (verified from a clean clone), `docs/AI-WORKFLOW.md`, MIT license, short single-source docs, `CLAUDE.md` as the only agent instruction file, curated images in `docs/images`, secret scan of the working tree and the whole Git history (none found), working screenshots no longer tracked and removed from the whole remote history (a fresh clone is about 25 MB instead of about 150 MB).
- Nothing else is open. Stage 07 adds no features.

## Verified at the last full check

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

Read [CLAUDE.md](CLAUDE.md) (agent rules), [PROJECT.md](PROJECT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [DECISIONS.md](DECISIONS.md) and the Stage 07 summary, then work only on the step the Tech Lead names.
