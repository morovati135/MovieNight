using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbImage
{
    [JsonPropertyName("file_path")]
    public string FilePath { get; init; } = string.Empty;
}
