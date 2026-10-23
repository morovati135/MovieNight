using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbProductionCountry
{
    [JsonPropertyName("iso_3166_1")]
    public string Code { get; init; } = string.Empty;
}
