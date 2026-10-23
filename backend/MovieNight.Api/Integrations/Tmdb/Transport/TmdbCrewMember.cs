using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbCrewMember
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("job")]
    public string? Job { get; init; }

    [JsonPropertyName("profile_path")]
    public string? ProfilePath { get; init; }
}
