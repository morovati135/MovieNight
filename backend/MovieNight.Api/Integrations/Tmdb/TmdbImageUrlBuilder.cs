namespace MovieNight.Api.Integrations.Tmdb;

internal static class TmdbImageUrlBuilder
{
    private const string BaseUrl = "https://image.tmdb.org/t/p/";

    public static string? BuildPosterUrl(string? imagePath) => BuildUrl("w780", imagePath);

    public static string? BuildBackdropUrl(string? imagePath) => BuildUrl("original", imagePath);

    public static string? BuildProfileUrl(string? imagePath) => BuildUrl("w185", imagePath);

    // Full quality: the frontend resizes thumbnails itself and shows the original in its full-size viewer.
    public static string? BuildSceneImageUrl(string? imagePath) => BuildUrl("original", imagePath);

    private static string? BuildUrl(string size, string? imagePath)
    {
        if (string.IsNullOrWhiteSpace(imagePath))
        {
            return null;
        }

        return $"{BaseUrl}{size}/{imagePath.TrimStart('/')}";
    }
}
