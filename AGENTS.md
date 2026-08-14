# MovieNight — Codex Project Instructions

## Role and working model
The human acts as Tech Lead and reviewer. Codex performs implementation work.
Work in small, explicitly requested sprints. Do not continue into a later sprint automatically.

## Canonical project context
Treat these files as the project sources of truth:
- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- the active file under `docs/stages/`

Do not use old chat history as a stronger source than repository documentation.

## Scope discipline
- Implement only the explicitly requested sprint or corrective review.
- Do not start the next sprint automatically.
- Do not add adjacent features because they seem useful.
- Do not perform unrelated refactors, renames, formatting sweeps, or cleanup.
- Do not introduce a package, framework, architectural pattern, service, or infrastructure component without a current requirement.
- For minor ambiguity, choose the simplest compliant option and state the assumption.
- Ask before changing architecture, security, product scope, or data semantics.

## Context discipline
- Read the active stage and relevant canonical project documents before substantial work.
- Inspect only code relevant to the current task.
- Do not scan every completed stage or the whole repository without a concrete reason.
- Prefer repository search and targeted file reads.

## Implementation discipline
- Inspect existing relevant code before modifying an unfamiliar area.
- Prefer explicit, straightforward code over premature abstraction.
- Preserve existing architectural boundaries unless the active sprint explicitly changes them.
- Never commit secrets or real API keys.
- Do not claim verification you did not actually run.

## Verification
Before reporting a sprint complete:
1. Run the narrowest relevant build/tests/checks required by the active stage.
2. Fix failures caused by the current changes.
3. Review the diff for unrelated edits.
4. Check for obvious dead/template code introduced by scaffolding.
5. Update `STATUS.md` only if the sprint is genuinely complete.

## Completion report
Finish implementation work with:
1. What changed
2. Files changed
3. Commands/tests executed
4. Verification result
5. Assumptions
6. Remaining issues
7. `STATUS.md` update status

## Git
- Prefer a clean working tree before starting a new accepted sprint.
- Do not commit automatically unless explicitly requested.
- Do not run destructive Git commands without explicit approval.
- Use Git checkpoints so each sprint can be reviewed and reverted independently.

## Review behavior
When asked to review rather than implement:
- inspect the diff and relevant files;
- prioritize correctness, scope violations, security, regressions, and misleading tests;
- do not modify files unless explicitly asked to fix findings.
