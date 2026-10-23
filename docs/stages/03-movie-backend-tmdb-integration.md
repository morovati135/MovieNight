# Stage 03 — Movie Backend and TMDB Integration

**Status:** completed.

**Goal:** the complete movie API behind MovieNight-owned DTOs.

**Delivered:** TMDB access with a read access token (user secrets or environment, never committed) and a preflight check; genres, trending, popular, search, discover and movie details (cast, similar/recommended movies); Pick for Me (random match from the first pages of a Discover query); image URL building; a small in-memory cache baseline; safe Problem Details for TMDB failures.

**Locked rules:** title search and filtered discovery are separate TMDB queries (D026); the public contract uses MovieSummary / MovieDetails / Cast DTOs and paged results, never TMDB models; TMDB failures become 502, unknown movies 404; the cache was later reviewed and hardened (D032).
