# MovieNight — Cursor Workflow

This file is for the human Tech Lead. It is not required context for every coding-agent chat.

## Default Workflow

For each sprint:

1. Open a fresh Cursor chat when the sprint starts a new feature area or the previous chat has accumulated unrelated context.
2. Attach only:
   - `PROJECT.md`
   - `ARCHITECTURE.md`
   - `DECISIONS.md`
   - `STATUS.md`
   - the active stage file
3. Let the agent inspect the relevant code rather than attaching the whole repository.
4. Use Plan Mode for multi-file/structural work.
5. Review the proposed plan when Plan Mode is used.
6. Let Agent implement only the current sprint.
7. Require build/tests defined by the sprint.
8. Review the diff.
9. Request corrections in the same chat if they are directly related to that sprint.
10. Commit only after the sprint is accepted.
11. Start the next sprint only after `STATUS.md` reflects the accepted state.

## Context Budget Discipline

Do not routinely attach:

- completed stage files,
- entire folders when exact relevant files are known,
- previous Cursor chats,
- long copied command outputs,
- generated files,
- package/build directories.

Use previous chat context only when a decision was not captured in project documentation.

## When to Use Plan Mode

Prefer Plan Mode when a task:

- touches multiple architectural areas,
- introduces persistence or API contracts,
- changes feature boundaries,
- requires a non-trivial refactor,
- has several viable implementation approaches.

Direct execution is usually enough for:

- a small bug fix,
- a narrow validation change,
- a single endpoint adjustment,
- a localized UI correction,
- a clearly specified test addition.

## Tech Lead Review Checklist

Before accepting a sprint, verify:

- Does the implementation match the sprint acceptance criteria?
- Did Agent add anything outside scope?
- Did it violate `DECISIONS.md`?
- Did it introduce a dependency unnecessarily?
- Is the code easier to understand than the abstraction it introduced?
- Are failure paths handled?
- Did required tests/builds actually run?
- Is `STATUS.md` accurate?
- Is the next sprint still independent and correctly scoped?

## Rule Maintenance

Keep `.cursor/rules` small.

Add or strengthen a rule only after observing a recurring agent mistake or a truly project-wide invariant.

Do not turn the rules directory into a duplicate architecture manual.
