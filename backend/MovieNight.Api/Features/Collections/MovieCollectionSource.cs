namespace MovieNight.Api.Features.Collections;

/// <summary>Where a curated collection's movies come from on TMDB.</summary>
public enum MovieCollectionSource
{
    /// <summary>A TMDB franchise collection (<c>collection/{id}</c>), in release order.</summary>
    Franchise,

    /// <summary>Popular movies from one or more production companies (<c>with_companies</c>, "|" = OR).</summary>
    Studio,

    /// <summary>Popular movies of one genre.</summary>
    Genre,
}
