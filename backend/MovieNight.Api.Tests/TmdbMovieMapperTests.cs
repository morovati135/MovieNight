using MovieNight.Api.Features.Movies;
using MovieNight.Api.Integrations.Tmdb.Transport;

namespace MovieNight.Api.Tests;

public sealed class TmdbMovieMapperTests
{
    [Fact]
    public void ToPagedMovieResult_maps_transport_fields_and_backend_owned_poster_url()
    {
        var page = new TmdbMoviePage
        {
            Page = 2,
            TotalPages = 9,
            TotalResults = 171,
            Results =
            [
                new TmdbMovie
                {
                    Id = 12,
                    Title = "Arrival",
                    Overview = "A linguist works with visitors.",
                    ReleaseDate = new DateOnly(2016, 11, 10),
                    GenreIds = [18, 878],
                    PosterPath = "/poster.jpg",
                    VoteAverage = 7.6
                }
            ]
        };

        var result = TmdbMovieMapper.ToPagedMovieResult(page);

        Assert.Equal(2, result.Page);
        Assert.Equal(9, result.TotalPages);
        Assert.Equal(171, result.TotalResults);
        var movie = Assert.Single(result.Results);
        Assert.Equal(12, movie.Id);
        Assert.Equal(new[] { 18, 878 }, movie.GenreIds);
        Assert.Equal("https://image.tmdb.org/t/p/w500/poster.jpg", movie.PosterUrl);
    }

    [Fact]
    public void ToMovieDetails_maps_genres_cast_in_order_and_image_urls()
    {
        var movie = new TmdbMovie
        {
            Id = 1,
            Title = "The Movie",
            Genres = [new TmdbGenre { Id = 28, Name = "Action" }],
            RuntimeMinutes = 123,
            PosterPath = "/poster.jpg",
            BackdropPath = "/backdrop.jpg",
            VoteAverage = 8.5
        };
        var credits = new TmdbMovieCredits
        {
            Cast =
            [
                new TmdbCastMember { Id = 2, Name = "Second", Character = "B", Order = 1 },
                new TmdbCastMember { Id = 1, Name = "First", Character = "A", Order = 0, ProfilePath = "/profile.jpg" }
            ]
        };

        var result = TmdbMovieMapper.ToMovieDetails(movie, credits);

        Assert.Equal("Action", Assert.Single(result.Genres).Name);
        Assert.Equal(123, result.RuntimeMinutes);
        Assert.Equal("https://image.tmdb.org/t/p/w500/poster.jpg", result.PosterUrl);
        Assert.Equal("https://image.tmdb.org/t/p/w780/backdrop.jpg", result.BackdropUrl);
        Assert.Collection(
            result.Cast,
            cast =>
            {
                Assert.Equal("First", cast.Name);
                Assert.Equal("https://image.tmdb.org/t/p/w185/profile.jpg", cast.ProfileUrl);
            },
            cast => Assert.Equal("Second", cast.Name));
    }

    [Fact]
    public void ToMovieSummary_returns_null_poster_url_when_tmdb_does_not_provide_an_image()
    {
        var result = TmdbMovieMapper.ToMovieSummary(new TmdbMovie { Id = 1, Title = "No Image" });

        Assert.Null(result.PosterUrl);
    }
}
