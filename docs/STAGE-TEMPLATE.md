# MovieNight — Stage Template

Do not duplicate large sections of `PROJECT.md`, `ARCHITECTURE.md`, `DECISIONS.md`, or `AGENTS.md`.

# Stage NN — <Stage Name>

## 1. Stage Intent
...

## 2. Canonical Context
- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- applicable `AGENTS.md`
- this stage file

## 3. Entry Criteria
- ...

## 4. Stage Outcome
...

## 5. In Scope
- ...

## 6. Out of Scope
- ...

## 7. Technical Constraints
...

# 8. Sprint Breakdown

## Sprint NN.1 — <Sprint Name>

### Goal
...

### Context
...

### Tasks
1. ...

### Expected Change Surface
```text
...
```

### Acceptance Criteria
- [ ] ...

### Verification
```text
...
```

### Completion Report
1. What changed
2. Files changed
3. Commands/tests executed
4. Verification result
5. Assumptions
6. Remaining issues
7. STATUS update status

### Stop Boundary
Do not start the next sprint automatically.

# 9. Stage Definition of Done
- [ ] Acceptance criteria pass.
- [ ] Relevant checks pass.
- [ ] No unrelated refactor/dependency.
- [ ] No secrets committed.
- [ ] STATUS is accurate.
- [ ] Tech Lead review complete.

# 10. Standard Codex Sprint Prompt
```text
Goal:
Execute only Sprint <NN.X> from `docs/stages/<stage>.md`.

Context:
Read applicable AGENTS.md, STATUS, the active sprint, and only relevant code.

Constraints:
Follow the sprint scope and stop boundary. Do not expand architecture, dependencies, or features.

Done when:
Run verification, fix failures caused by your changes, review the diff, update STATUS only if genuinely complete, provide the completion report, and stop before the next sprint.

Do not commit automatically.
```

# 11. Plan-mode variant
```text
Use Plan mode.

Plan only Sprint <NN.X>.
Read applicable AGENTS.md, canonical project docs, active stage, STATUS, and relevant code.

Return:
- current-state findings
- likely files to change
- implementation sequence
- risks/decisions
- verification
- conflicts with canonical project decisions

Do not implement yet.
Do not plan later sprints.
```
