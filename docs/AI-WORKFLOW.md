# Maintaining and Extending MovieNight with an AI Agent

MovieNight was built by an AI coding agent with a human as Tech Lead and reviewer. This guide is for the next person (or agent) who wants to keep working that way. The agent's own rules are in [CLAUDE.md](../CLAUDE.md); this page explains the process around them.

## Roles

- **Tech Lead (you):** decides scope, reviews every step, and is the only one who accepts work, commits and merges.
- **Agent:** investigates, implements, verifies and reports. It does not start the next task, change architecture or add features on its own.

## Setup for a new machine

1. Clone the repository and follow the [README](../README.md) to run it, including your own TMDB token (never paste it into a prompt, a file in the repository or an issue).
2. Open the repository in your AI tool. Claude Code loads `CLAUDE.md` automatically; any other tool should be told to read it first.
3. Run the verification commands once so you know the baseline is green.

## The working loop

1. **Ask for one small, specific thing.** "Add X to the Watchlist page", not "improve the app".
2. **Let the agent read first.** It reads `STATUS.md`, then `PROJECT.md`, `ARCHITECTURE.md` and `DECISIONS.md`, then only the code involved.
3. **For anything non-trivial, ask for a short plan** and approve it before any code is written.
4. **Review the result**, not just the summary: the diff, the commands that were run and their output, and the assumptions the agent states.
5. **Accept explicitly**, then ask for a commit. The agent never commits, pushes or opens pull requests on its own.
6. **Update `STATUS.md`** when the real state changed, and add a decision to `DECISIONS.md` when a rule changed.

## Verification the agent must run

| Change touches | Run |
|---|---|
| Backend | `dotnet test backend/MovieNight.slnx` |
| Frontend | `cd frontend && npm run typecheck && npx eslint && npm test && npm run build` |
| User-visible behavior | with both servers up: `npm run e2e`, `npm run e2e:sweep`, `npm run e2e:a11y` in `frontend/` |
| API shapes | update `contracts/api-shapes.json`, the DTOs and `frontend/src/types/` together; both test suites compare them |
| Dependencies | `npm audit` and `dotnet list backend/MovieNight.slnx package --vulnerable --include-transitive` |

A claim of "tested" without the command and its result is not accepted.

## Guardrails worth keeping

- **Scope:** one task at a time; no unrelated refactors; no new packages or patterns without a requirement (the non-goals are in `PROJECT.md`).
- **Decisions are durable:** changing one means editing `DECISIONS.md` first, with the reason.
- **Secrets:** nothing secret in Git, prompts, logs or screenshots. The pre-commit habit: look at `git diff --staged` before every commit.
- **Visuals:** the approved references in `.claude/skills/movienight-ui/` outrank existing code; check at 390, 768 and 1440 px.
- **Destructive actions** (history rewrites, force-pushes, deleting files outside the task) need your explicit approval each time.
- **Commit messages** describe the change (`feat(api): …`, `fix(frontend): …`), not the project phase.

## Adding a feature (example path)

1. Write the product decision (what, and what stays out) in `PROJECT.md` / `DECISIONS.md`.
2. Backend first: DTO, service, controller, tests (unit and an HTTP test in `MovieNight.Api.Tests/Http`); update `contracts/api-shapes.json`.
3. Frontend: types, `src/lib/api`, component, states (loading, empty, error), a Vitest test for logic.
4. Run the full verification above, then update `STATUS.md`.

## Keeping the docs healthy

Docs here are short on purpose: `STATUS.md` (where we are), `ROADMAP.md` (stages), `docs/stages/` (one short summary per stage), `PROJECT.md`, `ARCHITECTURE.md`, `DECISIONS.md`. Do not paste logs or session notes into them; Git history is the long record. If a document grows past a screen or two of content, compress it.
