using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbCollection
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("parts")]
    public IReadOnlyList<TmdbMovie> Parts { get; init; } = [];
}
