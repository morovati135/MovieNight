using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbCastMember
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("character")]
    public string? Character { get; init; }

    [JsonPropertyName("order")]
    public int Order { get; init; }

    [JsonPropertyName("profile_path")]
    public string? ProfilePath { get; init; }
}
