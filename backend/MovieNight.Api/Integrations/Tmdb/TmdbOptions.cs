namespace MovieNight.Api.Integrations.Tmdb;

public sealed class TmdbOptions
{
    public const string SectionName = "Tmdb";

    public string BaseUrl { get; init; } = "https://api.themoviedb.org/3/";

    public string ReadAccessToken { get; init; } = string.Empty;
}
