# MovieNight Frontend Implementation Rules

These rules apply to every MovieNight frontend sprint.

## Sprint isolation

Implement only the explicitly requested sprint scope.

Do not begin later sections because they are visually adjacent or technically convenient.

Do not perform unrelated refactors.

## Existing implementation

For the current redesign effort, the approved references and MovieNight requirements are the frontend design source of truth.

Do not derive the new visual design from the existing frontend.

Existing frontend code may be inspected only when needed to understand:
- API calls
- backend contracts
- existing data shapes
- working integration behavior
- reusable non-visual logic

Do not preserve an existing UI decision merely because it already exists in code.

## Backend contracts

Do not modify backend/API contracts unless the sprint explicitly requires it.

Prefer adapting the frontend to existing valid contracts.

## Data

Use real project/TMDB-backed data where the application already supports it.

Do not replace working API data with hardcoded fake movies merely to reproduce a screenshot.

Reference images define visual structure, not literal movie content.

## Components

Create reusable components where repetition and product consistency justify them.

Likely shared concepts include:
- AppHeader
- MovieCard
- MovieRail
- FeaturedMovieHero
- GenreControl
- WatchlistAction
- BottomNavigation

Avoid premature abstraction for one-off decorative details.

## Visual fidelity

Before completing a visual sprint:

1. run the application
2. inspect it in a real browser
3. validate 1440px
4. validate 768px
5. validate 390px
6. capture screenshots when tooling allows
7. compare with approved reference images
8. fix visible drift

Evaluate:
- composition
- spacing
- proportions
- image prominence
- typography hierarchy
- controls
- card density
- responsive behavior
- color/effect balance

Do not claim visual acceptance based only on code inspection.

## Interaction quality

All visible interactive controls must have appropriate states where applicable:
- default
- hover
- focus-visible
- active/pressed
- disabled
- selected

Keyboard interaction must remain usable.

## Motion

Motion should be functional and restrained.

Respect `prefers-reduced-motion`.

The Hero carousel must not force unnecessary motion on reduced-motion users.

## Accessibility

Preserve:
- semantic HTML
- meaningful button/link semantics
- keyboard navigation
- focus visibility
- reasonable contrast
- useful alternative text behavior
- usable touch targets

Accessibility fixes should not be used as justification to redesign the approved visual direction.

## Reporting

At sprint completion report:
- scope implemented
- files changed
- components added/updated
- behavior implemented
- viewport validation performed
- tests/checks run
- known limitations
- anything intentionally deferred to a later sprint
