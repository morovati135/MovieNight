namespace MovieNight.Api.Features.Collections;

/// <summary>
/// The fixed, curated set of Home collections (D030). Franchises use TMDB collections; "Marvel", "DC" and
/// "Musicals" are not TMDB collections, so they are built from studios and a genre.
/// </summary>
public static class MovieCollectionCatalog
{
    public static readonly IReadOnlyList<MovieCollectionDefinition> All =
    [
        new("marvel", "Marvel", MovieCollectionSource.Studio, "420"),
        new("dc", "DC", MovieCollectionSource.Studio, "9993|128064|429"),
        new("harry-potter", "Harry Potter", MovieCollectionSource.Franchise, "1241"),
        new("john-wick", "John Wick", MovieCollectionSource.Franchise, "404609"),
        new("godzilla", "Godzilla", MovieCollectionSource.Franchise, "535313"),
        new("musicals", "Musicals", MovieCollectionSource.Genre, "10402"),
        new("the-lord-of-the-rings", "The Lord of the Rings", MovieCollectionSource.Franchise, "119"),
        new("star-wars", "Star Wars", MovieCollectionSource.Franchise, "10"),
    ];

    public static MovieCollectionDefinition? Find(string slug) =>
        All.FirstOrDefault(collection => collection.Slug == slug);
}
