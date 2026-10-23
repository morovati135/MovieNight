---
name: movienight-ui
description: Project-specific product and visual contract for designing and implementing the MovieNight frontend. Use when building, restyling, reviewing, or validating MovieNight user-interface screens. This skill defines the approved routes, feature scope, visual-reference hierarchy, responsive rules, and implementation constraints. It must not be used for backend-only tasks.
---

# MovieNight UI

Use this skill as the project-specific source of truth for MovieNight frontend work.

## Authority order

When instructions conflict, follow this priority:

1. Current sprint scope explicitly supplied by the user.
2. MovieNight product requirements in `references/product-scope.md`.
3. Approved visual reference images under `assets/`.
4. MovieNight visual language in `references/visual-language.md`.
5. Responsive rules in `references/responsive.md`.
6. Page-specific requirements such as `references/home.md`.
7. Existing backend/API contracts.
8. Agent design preference or creativity.

Generic design advice must never override an approved MovieNight reference or product decision.

## Required workflow

Before implementing a MovieNight frontend sprint:

1. Read `references/product-scope.md`.
2. Read `references/implementation-rules.md`.
3. Read `references/visual-language.md`.
4. Read `references/responsive.md`.
5. Read the page-specific reference file for the current task.
6. Inspect only the reference assets relevant to the current sprint.
7. Inspect existing backend/API contracts required by the sprint.
8. Implement only the requested sprint scope.
9. Run the frontend.
10. Validate the result at the required viewport sizes.
11. Compare browser screenshots with the supplied visual references.
12. Fix visible layout, hierarchy, spacing, typography, and responsive drift before reporting completion.

## Reference rule

The approved reference images define appearance.

They should guide:
- composition
- hierarchy
- proportions
- density
- typography character
- spacing rhythm
- card treatment
- color balance
- gradients
- glow
- responsive composition

They do not define MovieNight functionality.

MovieNight requirements define:
- routes
- data
- actions
- behavior
- states
- scope

Do not copy irrelevant product features from a visual template.
