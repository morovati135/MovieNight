# MovieNight — Claude Entry Point

This file is a lightweight entry point. The canonical rules live in the repository docs listed below; do not treat this file as a replacement for them.

## Read before substantial work
- `AGENTS.md`
- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- the active file under `docs/stages/`
- any nested `AGENTS.md` relevant to the files being changed (e.g. `frontend/AGENTS.md`, `backend/AGENTS.md`)

## Working rules
- Repository docs are stronger context than chat history.
- The human is Tech Lead and reviewer. Claude performs implementation and investigation.
- Work only on the requested task. Do not continue automatically into the next sprint or work package.
- Determine current project state from `STATUS.md`.
- Inspect only relevant code.
- Preserve recorded architecture and decisions. Avoid unrelated cleanup or redesign.
- Do not commit unless explicitly requested.
- Run relevant verification before reporting completion.
- Update `STATUS.md` when actual project state changes.
- Never mark Tech Lead acceptance unless the human explicitly accepted it.
- Review tasks are read-only unless fixes are explicitly requested.

## Frontend visual work
- Approved references and project design guidance are the visual source of truth.
- Existing frontend code is not automatically a visual source of truth.
