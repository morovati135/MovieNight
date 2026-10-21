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
        Assert.Equal("https://image.tmdb.org/t/p/w780/poster.jpg", movie.PosterUrl);
    }

    [Fact]
    public void ToMovieDetails_maps_genres_cast_in_order_recommendations_and_image_urls()
    {
        var movie = new TmdbMovie
        {
            Id = 1,
            Title = "The Movie",
            Genres = [new TmdbGenre { Id = 28, Name = "Action" }],
            RuntimeMinutes = 123,
            PosterPath = "/poster.jpg",
            BackdropPath = "/backdrop.jpg",
            VoteAverage = 8.5,
            Credits = new TmdbMovieCredits
            {
                Cast =
                [
                    new TmdbCastMember { Id = 2, Name = "Second", Character = "B", Order = 1 },
                    new TmdbCastMember { Id = 1, Name = "First", Character = "A", Order = 0, ProfilePath = "/profile.jpg" }
                ]
            },
            Recommendations = new TmdbMoviePage
            {
                Results = [new TmdbMovie { Id = 3, Title = "Similar", PosterPath = "/similar.jpg" }]
            }
        };

        var result = TmdbMovieMapper.ToMovieDetails(movie);

        Assert.Equal("Action", Assert.Single(result.Genres).Name);
        Assert.Equal(123, result.RuntimeMinutes);
        Assert.Equal("https://image.tmdb.org/t/p/w780/poster.jpg", result.PosterUrl);
        Assert.Equal("https://image.tmdb.org/t/p/original/backdrop.jpg", result.BackdropUrl);
        Assert.Collection(
            result.Cast,
            cast =>
            {
                Assert.Equal("First", cast.Name);
                Assert.Equal("https://image.tmdb.org/t/p/w185/profile.jpg", cast.ProfileUrl);
            },
            cast => Assert.Equal("Second", cast.Name));
        var similarMovie = Assert.Single(result.SimilarMovies);
        Assert.Equal(3, similarMovie.Id);
        Assert.Equal("https://image.tmdb.org/t/p/w780/similar.jpg", similarMovie.PosterUrl);
    }

    [Fact]
    public void ToMovieDetails_limits_cast_and_recommendations_and_allows_missing_images()
    {
        var movie = new TmdbMovie
        {
            Id = 1,
            Title = "The Movie",
            Credits = new TmdbMovieCredits
            {
                Cast = Enumerable.Range(0, 13).Reverse().Select(index => new TmdbCastMember
                {
                    Id = index,
                    Name = $"Cast {index}",
                    Order = index
                }).ToArray()
            },
            Recommendations = new TmdbMoviePage
            {
                Results = Enumerable.Range(0, 13).Select(index => new TmdbMovie { Id = index + 10, Title = $"Similar {index}" }).ToArray()
            }
        };

        var result = TmdbMovieMapper.ToMovieDetails(movie);

        Assert.Equal(TmdbMovieMapper.DetailsCastLimit, result.Cast.Count);
        Assert.Equal("Cast 0", result.Cast[0].Name);
        Assert.Null(result.Cast[0].ProfileUrl);
        Assert.Equal(TmdbMovieMapper.SimilarMoviesLimit, result.SimilarMovies.Count);
        Assert.Null(result.SimilarMovies[0].PosterUrl);
    }

    [Fact]
    public void ToMovieDetails_maps_directors_production_countries_and_scene_images()
    {
        var movie = new TmdbMovie
        {
            Id = 1,
            Title = "The Movie",
            BackdropPath = "/hero.jpg",
            ProductionCountries = [new TmdbProductionCountry { Code = "US" }, new TmdbProductionCountry { Code = "DE" }],
            Credits = new TmdbMovieCredits
            {
                Crew =
                [
                    new TmdbCrewMember { Id = 5, Name = "Director", Job = "Director", ProfilePath = "/director.jpg" },
                    new TmdbCrewMember { Id = 6, Name = "Writer", Job = "Screenplay" },
                    new TmdbCrewMember { Id = 5, Name = "Director", Job = "Director" }
                ]
            },
            Images = new TmdbMovieImages
            {
                Backdrops = [new TmdbImage { FilePath = "/hero.jpg" }, new TmdbImage { FilePath = "/scene-1.jpg" }, new TmdbImage { FilePath = "/scene-2.jpg" }]
            }
        };

        var result = TmdbMovieMapper.ToMovieDetails(movie);

        var director = Assert.Single(result.Directors);
        Assert.Equal("Director", director.Name);
        Assert.Equal("https://image.tmdb.org/t/p/w185/director.jpg", director.ProfileUrl);
        Assert.Equal(["US", "DE"], result.ProductionCountryCodes);
        Assert.Equal(
            ["https://image.tmdb.org/t/p/original/scene-1.jpg", "https://image.tmdb.org/t/p/original/scene-2.jpg"],
            result.SceneImageUrls);
    }

    [Fact]
    public void ToMovieDetails_limits_scene_images_and_allows_missing_extras()
    {
        var movie = new TmdbMovie
        {
            Id = 1,
            Title = "The Movie",
            Images = new TmdbMovieImages
            {
                Backdrops = Enumerable.Range(0, 12).Select(index => new TmdbImage { FilePath = $"/scene-{index}.jpg" }).ToArray()
            }
        };

        var result = TmdbMovieMapper.ToMovieDetails(movie);

        Assert.Equal(TmdbMovieMapper.SceneImagesLimit, result.SceneImageUrls.Count);
        Assert.Empty(result.Directors);
        Assert.Empty(result.ProductionCountryCodes);
    }

    [Fact]
    public void ToMovieSummary_returns_null_poster_url_when_tmdb_does_not_provide_an_image()
    {
        var result = TmdbMovieMapper.ToMovieSummary(new TmdbMovie { Id = 1, Title = "No Image" });

        Assert.Null(result.PosterUrl);
    }
}
