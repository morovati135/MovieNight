using Microsoft.EntityFrameworkCore;
using MovieNight.Api.Features.Watchlists;

namespace MovieNight.Api.Data;

public sealed class MovieNightDbContext(DbContextOptions<MovieNightDbContext> options) : DbContext(options)
{
    public DbSet<WatchlistItem> WatchlistItems => Set<WatchlistItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<WatchlistItem>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.HasIndex(item => new { item.AnonymousId, item.MovieId }).IsUnique();
            entity.Property(item => item.AnonymousId).IsRequired();
            entity.Property(item => item.MovieId).IsRequired();
            entity.Property(item => item.CreatedAtUtc).IsRequired();
        });
    }
}
