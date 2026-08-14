# MovieNight — Codex Workflow

## Recommended primary surface
Use **Codex in the ChatGPT desktop app on Windows** as the primary workflow.

Why:
- local project/folder access
- native Windows PowerShell
- sandboxed filesystem/network permissions
- integrated Git and diff review
- worktrees/parallel chats available later
- no dependency on Cursor

Use **Codex CLI** as a secondary power-user surface for terminal-first work, slash commands, review, and later automation.

The **Codex IDE extension in VS Code** is optional. Add it only if editor-centric review is useful.

## Cost control
- Sign in with your ChatGPT account.
- Do not configure an API key for normal MovieNight work unless you intentionally want API-billed usage.
- Do not purchase extra Codex credits or enable automatic credit top-up unless you explicitly want pay-as-you-go usage.

## Standard sprint loop
1. Git checkpoint.
2. Start a fresh Codex chat for a new sprint/feature area.
3. Open the MovieNight repository.
4. Let Codex load applicable `AGENTS.md`.
5. Give the active stage/sprint and task-specific context.
6. Use Plan mode for complex or ambiguous work.
7. Implement only the current sprint.
8. Run verification.
9. Review the diff.
10. Fix same-sprint issues in the same chat.
11. Accept and commit only after review.
12. Start the next sprint in a clean chat.

## When to use Plan mode
Use Plan mode when work changes architecture/data model, spans feature boundaries, introduces persistence/external integration, or has several plausible approaches.

Direct execution is fine for a bounded corrective fix, simple endpoint adjustment, focused test, or explicit scaffolding.

## Prompt shape
A strong prompt has:
- Goal
- Context
- Constraints
- Done when

## Review
Use the desktop diff panel or CLI `/review` before commit.

## Context economy
Do not paste all docs into every prompt. `AGENTS.md` loads automatically.
Reference only the active stage and task-specific context.
