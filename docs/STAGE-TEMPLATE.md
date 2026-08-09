# MovieNight — Stage Template

Use this template for every implementation stage under `docs/stages/`.

The purpose of a stage file is to give the coding agent enough context to execute one bounded area of work without re-reading the entire project history.

Do not duplicate large sections of `PROJECT.md`, `ARCHITECTURE.md`, or `DECISIONS.md`. Reference them instead.

---

# Stage NN — <Stage Name>

## 1. Stage Intent

Describe in 2–5 sentences:

- what this stage accomplishes,
- why it exists now,
- what becomes possible after it is complete.

Keep this section outcome-oriented.

---

## 2. Canonical Context

The agent should treat these as the stable sources of truth:

- `PROJECT.md` — product scope and business rules
- `ARCHITECTURE.md` — architectural boundaries
- `DECISIONS.md` — locked decisions
- `STATUS.md` — current project state
- this stage file — current execution scope

Do not read all other stage files unless a dependency is explicitly referenced.

---

## 3. Entry Criteria

List what must already be true before this stage starts.

Example:

- Backend project builds successfully.
- TMDB configuration is available through environment/configuration.
- Previous stage acceptance criteria are complete.

---

## 4. Stage Outcome

State the externally observable result of completing the stage.

Example:

> After this stage, the backend exposes working movie discovery endpoints backed by TMDB and covered by relevant tests.

---

## 5. In Scope

List only capabilities that belong to this stage.

- ...
- ...
- ...

---

## 6. Out of Scope

Explicitly list tempting adjacent work that must not be implemented.

- ...
- ...
- ...

This section is important for preventing scope expansion by the coding agent.

---

## 7. Technical Constraints

Record only constraints specific to this stage.

Do not repeat the entire architecture document.

Examples:

- Public API must expose application DTOs, not TMDB transport models.
- Do not introduce a new package unless the current stack cannot reasonably satisfy the requirement.
- Do not refactor unrelated features.

---

# 8. Sprint Breakdown

Each sprint must be independently reviewable and verifiable.

---

## Sprint NN.1 — <Sprint Name>

### Objective

One concise outcome.

### Required Context

Reference only the context likely to matter for this sprint.

Example:

- `@PROJECT.md`
- `@ARCHITECTURE.md`
- `@DECISIONS.md`
- `@STATUS.md`
- `@docs/stages/NN-stage-name.md`
- relevant existing feature files discovered by the agent

Do not attach the entire repository by default.

### Tasks

1. ...
2. ...
3. ...

Tasks should describe behavior and necessary implementation, not prescribe unnecessary low-level code.

### Expected Change Surface

Identify the likely areas of the repository.

Example:

```text
backend/MovieNight.Api/Integrations/Tmdb/
backend/MovieNight.Api/Features/Movies/
backend/MovieNight.Api.Tests/
```

This is guidance, not a hard file allow-list. The agent may touch another directly required file but must explain why.

### Acceptance Criteria

Use observable, testable statements.

- [ ] ...
- [ ] ...
- [ ] ...

Avoid criteria such as "code is clean" without defining an observable expectation.

### Verification

Specify the narrowest useful verification.

Example:

```text
dotnet build
dotnet test
```

If only a focused test project or command is required, prefer that over unnecessary full-repository work.

### Sprint Completion Report

At the end of the sprint the agent must report:

1. What changed
2. Files changed
3. Commands/tests executed
4. Verification result
5. Any unresolved issue
6. Any deliberate assumption
7. Whether `STATUS.md` was updated

### Stop Boundary

Do not start the next sprint automatically.

Finish this sprint, verify it, report the result, and wait for review.

---

## Sprint NN.2 — <Sprint Name>

Repeat the same structure.

---

# 9. Stage Definition of Done

The stage is complete only when:

- [ ] Every sprint acceptance criterion is satisfied.
- [ ] Relevant builds/tests pass.
- [ ] No unrelated refactor was introduced.
- [ ] No unapproved dependency or architecture pattern was added.
- [ ] No secret was committed.
- [ ] `STATUS.md` accurately reflects the completed work.
- [ ] Remaining known issues are explicitly documented.

---

# 10. Context Efficiency Rules

For this stage:

1. Start from the canonical context and current sprint.
2. Inspect only code relevant to the current sprint.
3. Do not read completed stage files unless needed to resolve a concrete dependency.
4. Prefer targeted file references over attaching broad folders when relevant files are already known.
5. Do not restate project-wide rules in implementation prompts.
6. Start a fresh Cursor chat when moving to a substantially different stage or when the existing chat context becomes noisy.
7. Use Plan Mode for multi-file or structurally significant work; routine bounded edits can be executed directly.
8. Do not use previous chat history as the primary source of truth when the repository documentation already records the decision.

---

# 11. Standard Cursor Sprint Prompt

Use this as the default opening prompt for a new sprint chat.

```text
We are working on MovieNight.

Execute only Sprint <NN.X — Sprint Name> from:
@docs/stages/<stage-file>.md

Use these files as canonical project context:
@PROJECT.md
@ARCHITECTURE.md
@DECISIONS.md
@STATUS.md

First inspect only the existing files relevant to this sprint.

Before implementation:
- identify any conflict between the sprint and canonical project decisions;
- if there is no blocking conflict, proceed;
- for minor ambiguity, choose the simplest compliant option and state the assumption;
- do not expand scope.

Implement only the current sprint.

After implementation:
- run the verification required by the sprint;
- fix failures caused by your changes;
- review the changed files for unrelated edits;
- update STATUS.md only if the sprint is actually complete.

Finish with the required Sprint Completion Report.
Do not start the next sprint.
```

---

# 12. Plan Mode Prompt Variant

For a sprint that is architecturally significant or touches several areas:

```text
Create an implementation plan for Sprint <NN.X> only.

Use:
@PROJECT.md
@ARCHITECTURE.md
@DECISIONS.md
@STATUS.md
@docs/stages/<stage-file>.md

Inspect only the code relevant to this sprint.

The plan must include:
- current-state findings,
- files likely to change,
- implementation sequence,
- business/technical risks,
- verification steps,
- any decision that would conflict with existing project documents.

Do not implement anything yet.
Do not plan work from later sprints.
```
