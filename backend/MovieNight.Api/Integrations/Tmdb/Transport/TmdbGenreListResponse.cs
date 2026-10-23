using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbGenreListResponse
{
    [JsonPropertyName("genres")]
    public IReadOnlyList<TmdbGenre> Genres { get; init; } = [];
}
