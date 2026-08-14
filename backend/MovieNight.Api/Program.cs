using System.Net.Http.Headers;
using Microsoft.Extensions.Options;
using MovieNight.Api.Integrations.Tmdb;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddOptions<TmdbOptions>().BindConfiguration(TmdbOptions.SectionName)
    .Validate(
        options => Uri.TryCreate(options.BaseUrl, UriKind.Absolute, out var baseUrl) && baseUrl.Scheme == Uri.UriSchemeHttps,
        "Tmdb:BaseUrl must be an absolute HTTPS URL.")
    .Validate(
        options => !string.IsNullOrWhiteSpace(options.ReadAccessToken),
        "TMDB configuration is missing. Set Tmdb__ReadAccessToken through a local environment variable or user secret.")
    .ValidateOnStart();
builder.Services.AddHttpClient<TmdbClient>((serviceProvider, client) =>
{
    var options = serviceProvider.GetRequiredService<IOptions<TmdbOptions>>().Value;

    client.BaseAddress = new Uri(options.BaseUrl, UriKind.Absolute);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.ReadAccessToken);
    client.Timeout = TimeSpan.FromSeconds(10);
});
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000");
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

app.MapControllers();

app.Run();
