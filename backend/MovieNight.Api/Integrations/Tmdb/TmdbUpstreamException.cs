namespace MovieNight.Api.Integrations.Tmdb;

public sealed class TmdbUpstreamException : Exception
{
    public TmdbUpstreamException(string message)
        : base(message)
    {
    }
}
