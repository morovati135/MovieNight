namespace MovieNight.Api.Integrations.Tmdb;

internal static class TmdbImageUrlBuilder
{
    private const string BaseUrl = "https://image.tmdb.org/t/p/";

    public static string? BuildPosterUrl(string? imagePath) => BuildUrl("w780", imagePath);

    // Backdrops fill cards, blurred backgrounds and full-width heroes: w1280 is sharp enough for those, while
    // "original" files are several MB, load slowly and can exceed the Next image optimiser's upstream timeout.
    public static string? BuildBackdropUrl(string? imagePath) => BuildUrl("w1280", imagePath);

    public static string? BuildCardBackdropUrl(string? imagePath) => BuildUrl("w1280", imagePath);

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
