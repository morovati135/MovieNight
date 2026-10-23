# MovieNight Responsive Rules

Responsive design is a composition task, not a scaling task.

Required validation widths:

- Desktop: 1440px
- Tablet: 768px
- Mobile: 390px

Use these widths as primary design and QA checkpoints.

## Workflow

For every page:

Desktop
→ Tablet
→ Mobile
→ Visual review
→ Lock

Do not finalize a page before its three primary responsive compositions are validated.

## Desktop

Desktop navigation uses the top application header.

Primary destinations:
- Discover
- Pick for Me
- Watchlist

Search remains available in the Home context.

Desktop movie rails should expose several posters while retaining comfortable artwork size.

## Tablet

Tablet is not simply a narrower desktop.

Rebalance:
- content width
- hero composition
- typography scale
- controls
- poster density
- section gaps

Do not wait until mobile to address responsive problems.

## Mobile navigation

Use a compact top bar for:
- MovieNight identity
- Search access

Primary destination navigation should use bottom navigation:

- Discover
- Pick
- Watchlist

Pick must remain a first-class destination and must not be hidden inside a hamburger menu.

## Mobile Hero

The Hero may significantly change composition.

Use the mobile template reference as guidance.

Prioritize:
1. artwork
2. movie identity
3. metadata
4. overview
5. actions
6. carousel navigation

Do not force the desktop horizontal composition into the mobile viewport.

## Movie rails

Discovery movie lists use horizontal rails.

On smaller screens:
- reduce the number of fully visible posters
- preserve useful poster size
- allow swipe/scroll
- where appropriate, leave a portion of the next card visible to communicate horizontal continuation

Do not shrink posters until an entire desktop row fits on mobile.

## Genre chips

Genre controls should:
- remain on one horizontal line
- allow horizontal scrolling
- have clear selected state
- use comfortable touch targets

Do not wrap the entire genre list into several tiny rows.

## Touch

Interactive mobile controls need practical touch areas.

Small visual icons may use a larger invisible/structural hit area.

## Bottom navigation

Bottom navigation must:
- remain visually distinct from movie content
- show the active destination
- respect device bottom safe-area behavior
- avoid covering page content

## Content density

Mobile should remain cinematic and image-driven.

Reduce:
- simultaneous visible cards
- secondary metadata
- decorative complexity

Do not remove primary actions or product functionality merely to fit the screen.

==================================================
