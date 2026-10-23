using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbMovieImages
{
    [JsonPropertyName("backdrops")]
    public IReadOnlyList<TmdbImage> Backdrops { get; init; } = [];
}
