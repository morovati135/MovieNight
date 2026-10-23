# MovieNight — Stage 07: Final Polish & Portfolio Handoff

## Stage Status

**In Progress — sprint breakdown and additions approved by the Tech Lead on 2026-10-23.**

Stage 06 — Full-Stack Integration, Testing & Runtime Hardening is accepted and complete (2026-10-23).

---

# 1. Stage Intent

Turn the verified application into a clean portfolio deliverable that a stranger can clone, run, understand and be impressed by. No new product feature is introduced (ROADMAP rule). Each sprint fixes what it finds or records it for the Tech Lead.

---

# 2. Starting Point (facts from the repository on 2026-10-23)

- Verified: 178 backend tests, 41 frontend tests, 17 browser journey checks, 13-route × 3-width sweep, 0 npm / NuGet vulnerabilities.
- **No root `README.md`** and no frontend README; `backend/README.md` is 30 lines. There are no run instructions for a newcomer (TMDB token via user secrets, ports, database creation, tests).
- **`docs/screenshots` holds 246 working screenshots (119 MB)** from Stages 05.x; none is curated for presentation.
- Line endings: every `git` command warns "LF will be replaced by CRLF"; there is no `.gitattributes`.
- Dead code found by `knip`: `src/lib/api/health.ts` (unused file), unused `SectionHeading` export, duplicate default exports in two effect components, two unused exported types, unused exports in `e2e/browser.mjs`. Backend not yet scanned.
- Known performance limit from Stage 06: first load of artwork can take 2–7 s when TMDB's image CDN is slow (the Next image optimizer then returns 504 and the fallback loads the image directly); the Hero loads inactive slides eagerly.
- Markdown: 7,700 lines outside `.agents/`; stage files 04 and 05 alone are 3,300 lines. `AGENTS.md` and `CLAUDE.md` overlap; nested `backend/AGENTS.md` and `frontend/AGENTS.md` exist (the latter is rewritten by Next on every run). `docs/CODEX-WORKFLOW.md` describes one tool's workflow.
- `.agents/` holds 203 vendored third-party skill files (27 MB: brand, banner, slides, design, ui-ux-pro-max and others) of which only `movienight-ui` is project-specific.
- Backend files that hold several types: `Integrations/Tmdb/Transport/TmdbMovieTransportModels.cs` (12 classes), query models in `MoviesController.cs`, exceptions in `TmdbClient.cs`, `MovieCollectionCatalog.cs`, `WatchlistService.cs`.
- Page metadata: root title and description only; per-page titles exist on some routes (`about`, `browse`, `pick`, `watchlist`); no social preview image.

---

# 3. Sprint Breakdown (approved, with the Tech Lead's additions)

## Sprint 07.1 — Performance & Loading Polish

Measure first-load artwork and page timing (production build), then fix the worst: Hero slide loading, image sizes and priority, optimizer timeout behavior, skeleton-to-content shifts. Final review of every loading, empty and error state (each route, three widths). Output: before / after numbers recorded.

## Sprint 07.2 — Accessibility, Responsive & Metadata Review

Keyboard-only pass on every route, focus order and visible focus, screen-reader names (poster cards expose titles only through the link label), contrast, reduced motion, 320 px width, touch targets. Page titles and descriptions for every route, Open Graph preview image, favicon check.

## Sprint 07.3 — Code Cleanup, Backend Structure & Dead Code

- Remove dead code and unused files (frontend: `knip` findings; backend: scan); compiler and ESLint warnings to zero; comments and naming consistent with the surrounding code.
- **One type per file in the backend** (Tech Lead request): split `TmdbMovieTransportModels.cs`, the query models, the TMDB exceptions and other multi-type files into their own files, keeping namespaces, then update every reference and test project so the solution builds. No logic change, proved by the existing 178 tests.
- `.gitattributes` for consistent line endings; remove stray files.

## Sprint 07.4 — Documentation, Repository Hygiene & Secrets

- **Screenshots (Tech Lead decision):** `docs/screenshots/` is git-ignored and removed from the repository (`git rm --cached`; local files stay). The README's preview and gallery use 10–12 curated final images in a tracked `docs/images/`. Removing the old images from Git *history* needs a history rewrite and a force-push; it is proposed separately and not done without explicit approval.
- **Markdown clean-up (Tech Lead decision):** one canonical agent-instructions file (`AGENTS.md`); `CLAUDE.md` is removed or reduced to a one-line pointer to it (Claude Code only reads `CLAUDE.md` by name, so the pointer is the recommended choice); remove duplicated and useless Markdown; shrink the long stage files to short summaries (goal, outcome, decisions, status; the long originals stay in Git history); standardize the structure of every document (what / who / how to use); no personal paths, e-mail addresses, machine names or secrets in any Markdown; every instruction works on a new machine.
- **Vendored skills:** remove the unrelated third-party skill packs in `.agents/` (about 27 MB), keep the project-specific `movienight-ui` skill, and document how to reinstall optional skills.
- **AI-assisted development guide** (`docs/AI-WORKFLOW.md`): how to maintain and extend the project with an AI agent: reading order, sprint rules, verification commands, commit rules, what the agent may and may not do.
- **Professional root README** with the project preview image: features, tech stack, architecture, run locally step by step, tests, project structure, decisions, limits, TMDB attribution, license.
- **Secrets and API key guide:** prove the repository holds no secret (working tree and full Git history scan; `.gitignore`, `.env.example`); README section on getting a TMDB account and a *Read Access Token* and configuring it safely: .NET user secrets for local development, the `Tmdb__ReadAccessToken` environment variable for a host, never in a committed file or in the frontend.
- Frontend README; follow the README on a clean clone and fix every gap.

## Sprint 07.5 — Final Verification & Portfolio Handoff

Full regression from a clean clone, final dependency / security check, demo script and screenshots, portfolio / LinkedIn notes, `v1.0.0` tag suggestion. Project marked complete only after Tech Lead acceptance.

---

# 4. Decisions Recorded

- Order 07.1 → 07.5; cleanup before documentation so the docs describe the final code.
- MIT license (the README carries the TMDB attribution); still-image gallery, no GIF.
- Deployment is out of scope; D033's open items (CSP, rate limiting, HTTPS / HSTS) are listed in the README as "before deploying".
- Open for the Tech Lead when reached in 07.4: `CLAUDE.md` as pointer vs. deleted; whether to rewrite Git history to purge old screenshots.

# 5. Constraints

- No new product features or redesigns; fixes and polish only.
- Preserve recorded architecture and decisions; changes go through `DECISIONS.md`.
- One sprint at a time; do not continue to the next sprint automatically.
- Commit only when the Tech Lead asks; commit messages describe the change, not the sprint (see CLAUDE.md).
