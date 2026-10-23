# MovieNight — Product Definition

## Vision

MovieNight is a small, portfolio-ready full-stack movie app with an intentionally limited scope. Visitors discover movies, inspect details, get a simple recommendation and keep a private watchlist without registering. The engineering goal is a complete, polished application built almost entirely through an AI coding agent in small, reviewable steps, with a simple architecture.

## Features

- **Home:** hero, trending, popular, genre discovery, curated collections, "Iconic: Top rated of all time", entry points to Pick for Me and the Watchlist; "See more" opens a paged category page.
- **Search and discovery:** by title, with optional year; filter by genre, year and minimum rating; paged results.
- **Movie details:** poster, backdrop, title, overview, release date, runtime, genres, rating, cast, directors, countries, scene images, recommendations, add-to-watchlist.
- **Pick for Me:** optional genre, minimum year and minimum rating; the backend returns one random match (rule-based, not AI).
- **Anonymous watchlist:** one private list per browser (up to 50 movies), reopened from the same browser; not shared by URL.
- **About and footer:** a portfolio note and the TMDB attribution.

## Data source

TMDB is the source of truth. Flow: frontend → ASP.NET Core API → TMDB; the frontend never calls TMDB's API. The backend owns authentication with TMDB, request building, mapping to MovieNight DTOs, caching, validation and error handling. The database stores only watchlist rows (anonymous id + TMDB movie id).

## Business rules

1. No registration or login.
2. A watchlist is private to its anonymous browser, holds at most 50 movies and never contains a movie twice.
3. A movie is validated against TMDB before it is added.
4. Rating filters are 0–10; invalid years are rejected; blank search queries are rejected.
5. TMDB errors never reach the frontend raw; the frontend only sees MovieNight DTOs and Problem Details.

## Non-goals

Registration, login, Identity, JWT, profiles, roles, admin, reviews, comments, user ratings, likes, notifications, e-mail, payments, TV series, localization, Redis, message brokers, CQRS, MediatR, generic repositories, unit-of-work wrappers, multi-project Clean Architecture, microservices, Docker, Kubernetes, CI/CD and production deployment. Changing any of these needs an explicit scope decision.

## Quality expectations

Visually polished, responsive, accessible, consistent, easy to run locally, simple to understand and free of unnecessary abstractions. Prefer the simplest design that satisfies the current requirement; do not add abstractions, libraries or infrastructure for a hypothetical future.
