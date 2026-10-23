# MovieNight Product Scope

MovieNight is a small, polished movie-discovery application.

The current product is movie-only.

## Routes

### `/`
Home / Discover.

### `/movies/[id]`
Movie Details.

### `/pick`
Pick for Me.

### `/watchlist`
Anonymous Watchlist.

### `/about`
About page: portfolio note and Socials (D030).

### `/browse/[category]`
See more / category pages with a grid and paging: `trending`, `popular`, `iconic` or a collection slug (D030).

## Explicitly out of scope

Do not introduce:
- authentication
- sign in
- sign up
- user profiles
- account settings
- TV series
- subscription plans
- pricing
- streaming playback
- continue watching
- playback progress
- kids mode
- studio browsing
- FAQ marketing sections
- social features
- multi-user synchronization

## Anonymous Watchlist

Watchlist is intentionally anonymous. There is no login or account.

Each browser has one private Watchlist:
- the MovieNight backend identifies the browser with a protected, persistent, HttpOnly anonymous cookie that it creates and owns;
- Watchlist items are persisted server-side by the backend;
- the backend Watchlist API is the only source of truth for Watchlist contents.

Frontend Watchlist requests go through the centralized frontend API layer under `src/lib/api/` and must send browser credentials so the cookie is included.

Do not:
- require login
- prompt the user to create an account
- use `localStorage`, `sessionStorage`, IndexedDB, or frontend-managed cookies to store Watchlist contents or as the Watchlist source of truth
- read, display, create, or store the anonymous identity in frontend code
- imply cross-device or account-based synchronization; clearing browser data or using another browser starts a different Watchlist

Short-lived in-memory UI state, such as saved movie IDs derived from the current Watchlist response, is allowed for the active page.

## Home features

Home contains:
- application header/navigation
- search
- featured movie hero
- Trending movies
- Popular movies
- genre discovery
- Pick for Me promotional CTA
- optional Watchlist preview
- minimal footer

## Featured Hero

The hero is a cinematic carousel.

Requirements:
- six featured movies
- approximately seven-second auto advance
- previous and next controls
- slide indicators
- pause and resume support
- pause during relevant hover/focus interactions
- reduced-motion handling
- strong movie artwork prominence
- title
- metadata
- short overview
- View Details action
- Watchlist action

## Search

Search belongs to Home.

There is no standalone Search route in the current scope.

## Genre discovery

Trending and Popular are independent rails.

Selecting a genre must not locally filter or replace Trending or Popular.

Genre selection produces a separate Discover result for the selected genre.

## Movie Details

Movie Details should support:
- cinematic backdrop
- poster
- title
- release metadata
- runtime where available
- rating
- genres
- overview
- Watchlist action
- Cast
- Similar Movies

It should remain image-driven and cinematic rather than becoming a text-heavy information page.

## Pick for Me

Pick for Me is a signature MovieNight feature.

The flow contains:
- preference/filter controls
- loading state
- one spotlight recommendation
- primary movie information
- View Details
- Add to Watchlist
- Pick Again

The result should feel like a deliberate recommendation, not another generic movie grid.

Do not present the feature as an LLM or AI recommendation unless the actual implementation later uses one.

## Watchlist page

The Watchlist page contains:
- page title
- concise description
- subtle browser-private note
- saved movie grid
- View Details
- Remove
- empty state

==================================================
