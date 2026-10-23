namespace MovieNight.Api.Features.Caching;

/// <summary>
/// How long each category of TMDB data may be served from memory. Longer lifetimes are faster (a cold TMDB
/// call costs 0.5-5 s, a cached one about 2 ms), so each is as long as the data's rate of change allows.
/// </summary>
public static class CacheTtl
{
    /// <summary>Genre names effectively never change.</summary>
    public static readonly TimeSpan Genres = TimeSpan.FromHours(24);

    /// <summary>Curated collections and their pages change only when TMDB reorders a studio or franchise.</summary>
    public static readonly TimeSpan Collections = TimeSpan.FromHours(12);

    /// <summary>The all-time top rated list barely moves.</summary>
    public static readonly TimeSpan TopRated = TimeSpan.FromHours(6);

    /// <summary>Movie details and summaries: only vote counts and ratings drift.</summary>
    public static readonly TimeSpan Movie = TimeSpan.FromHours(2);

    /// <summary>Trending and popular are recomputed by TMDB over hours, not seconds.</summary>
    public static readonly TimeSpan Trending = TimeSpan.FromMinutes(30);

    /// <summary>Discover results (genre, year, rating) shift slowly; Home genre switching repeats them.</summary>
    public static readonly TimeSpan Discover = TimeSpan.FromMinutes(15);

    /// <summary>A movie id TMDB does not know: short, so a newly added movie appears soon.</summary>
    public static readonly TimeSpan NotFound = TimeSpan.FromMinutes(1);
}
