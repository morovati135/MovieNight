# Stage 04 — Anonymous Watchlist Backend and Persistence

**Status:** completed.

**Goal:** a persistent, account-free watchlist and a usable API reference.

**Delivered:** SQLite + EF Core with migrations; a protected persistent anonymous cookie (`movienight.anonymous-id`, HttpOnly, SameSite=Lax, one year, Secure on HTTPS); watchlist rows holding only the anonymous id and TMDB movie id; `GET /api/watchlist`, `POST` and `DELETE /api/watchlist/{movieId}`; OpenAPI and Scalar in Development.

**Locked rules:** at most 50 movies; no duplicates; add and remove are idempotent; a movie is validated against TMDB before saving; listing hydrates ids through the cached summary lookup with bounded concurrency (4); an unknown movie is skipped and a TMDB outage is a 502 (D007–D009, D025).
