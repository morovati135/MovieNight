# MovieNight — Project Definition

## 1. Product Vision

MovieNight is a small full-stack movie discovery application designed to be portfolio-ready while remaining intentionally limited in scope.

The application allows users to discover movies, inspect movie details, receive a simple recommendation, and maintain an anonymous shareable watchlist without registration or login.

The primary engineering goal is to build the project almost entirely through an AI coding agent while keeping the codebase simple, reviewable, and maintainable.

---

## 2. Primary Goals

- Build a complete full-stack application that runs locally.
- Use ASP.NET Core as a real backend, not only as a proxy.
- Keep the frontend visually polished and portfolio-ready.
- Keep the architecture intentionally simple.
- Practice Agent Engineering through small, controlled implementation stages.
- Make every sprint independently reviewable and verifiable.

---

## 3. Target Users

A visitor who wants to:

- discover movies,
- search and filter movies,
- inspect movie details,
- receive a movie suggestion,
- create a personal watchlist without creating an account,
- share that watchlist through a public URL.

---

## 4. Core Features

### 4.1 Home

The home page should contain:

- Hero section
- Trending movies
- Popular or top-rated movies
- Entry point to Discover
- Entry point to Pick for Me

### 4.2 Movie Discovery

Users can:

- search movies by title,
- filter by genre,
- filter by release year,
- filter by minimum rating,
- navigate paginated results.

### 4.3 Movie Details

The movie details page should show:

- poster,
- backdrop,
- title,
- overview,
- release date,
- runtime,
- genres,
- rating,
- cast,
- similar movies,
- add-to-watchlist action.

### 4.4 Pick for Me

Users can provide simple preferences such as:

- genre,
- minimum release year,
- minimum rating.

The backend queries eligible candidates and returns one recommendation.

This is rule-based/randomized recommendation logic, not AI recommendation.

### 4.5 Anonymous Watchlist

Users can:

- create one anonymous watchlist,
- give it a name,
- add movies,
- remove movies,
- reopen it later from the same browser,
- share it through a public URL.

A watchlist has:

- `PublicId`
- `OwnerTokenHash`
- `Name`
- `CreatedAt`
- `Items`

The raw owner token is returned only when the watchlist is created.

The frontend stores:

- `PublicId`
- raw `OwnerToken`

in browser local storage.

Public visitors can read a shared watchlist.

Only a client with a valid owner token can modify it.

---

## 5. Movie Data Source

TMDB is the source of truth for movie data.

The frontend must never call TMDB directly.

Required flow:

Frontend -> ASP.NET Core API -> TMDB

The backend is responsible for:

- TMDB authentication,
- request construction,
- response mapping,
- caching,
- validation,
- third-party error handling,
- business logic.

---

## 6. Watchlist Persistence

The project does not maintain a full local movie catalog.

When a movie is added to a watchlist, store only the snapshot required to render that watchlist efficiently.

A watchlist item may contain:

- `TmdbMovieId`
- `Title`
- `PosterPath`
- `ReleaseDate`
- `Rating`
- `AddedAt`

Before adding a movie, the backend must validate that the movie exists in TMDB.

---

## 7. Business Rules

1. Registration and login do not exist.
2. A watchlist is publicly readable by its `PublicId`.
3. Watchlist mutations require a valid owner token.
4. The backend stores only a hash of the owner token.
5. A movie cannot exist more than once in the same watchlist.
6. A watchlist can contain at most 30 movies.
7. Movies must be validated through TMDB before being added.
8. Rating filters must be between 0 and 10.
9. Invalid year filters must be rejected.
10. Empty search queries must not be sent as movie searches.
11. Third-party TMDB errors must not leak directly to the frontend.
12. Movie data exposed to the frontend must use application-owned DTOs rather than raw TMDB response models.

---

## 8. Primary User Flows

### Flow A — Discovery

Home -> Trending movie -> Movie details -> Similar movie -> Movie details

### Flow B — Search

Discover -> Search by title -> Results -> Movie details

### Flow C — Filtering

Discover -> Apply genre/year/rating filters -> Results

### Flow D — Recommendation

Pick for Me -> Select preferences -> Backend selects candidate -> Movie details

### Flow E — Create Watchlist

Movie details -> Add to watchlist -> No watchlist exists -> Create watchlist -> Store ownership locally -> Add movie

### Flow F — Returning Owner

Open application -> Read local ownership data -> Open My Watchlist -> Modify watchlist

### Flow G — Shared Watchlist

Owner copies public URL -> Another visitor opens URL -> Read-only watchlist

---

## 9. Non-Goals

Do not implement any of the following unless the project scope is explicitly changed:

- Registration
- Login
- ASP.NET Identity
- JWT authentication
- User profiles
- Roles
- Permissions
- Admin panel
- Reviews
- Comments
- User ratings
- Likes
- Notifications
- Email
- Payments
- TV series
- Multi-language UI
- Localization
- Redis
- Message brokers
- CQRS
- MediatR
- Generic repository abstraction
- Custom Unit of Work abstraction
- Clean Architecture with multiple projects/layers
- Microservices
- Docker
- Kubernetes
- CI/CD
- Production deployment

---

## 10. Product Quality Expectations

The application should be:

- visually polished,
- responsive,
- consistent,
- easy to run locally,
- simple to understand,
- explicit in its business rules,
- free of unnecessary abstractions.

The frontend may be sophisticated visually, but the underlying implementation should remain straightforward.

---

## 11. Engineering Principle

Prefer the simplest design that clearly satisfies the current project requirements.

Do not introduce an abstraction, library, architectural pattern, or infrastructure component only because it may be useful in a hypothetical future version.
