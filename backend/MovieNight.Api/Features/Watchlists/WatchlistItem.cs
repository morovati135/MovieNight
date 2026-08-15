namespace MovieNight.Api.Features.Watchlists;

public sealed class WatchlistItem
{
    public Guid Id { get; set; }

    public Guid AnonymousId { get; set; }

    public int MovieId { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
