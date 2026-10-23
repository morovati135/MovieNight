/**
 * TMDB image URLs (as returned by the MovieNight backend) have the form
 * `https://image.tmdb.org/t/p/{size}/{file}`. This returns the same image at another TMDB size
 * (e.g. "original"), so a page can upgrade an image the backend already provided.
 */
export function tmdbImageAtSize(url: string, size: "original" | "w1280" | "w780"): string {
  return url.replace(/^(https:\/\/image\.tmdb\.org\/t\/p\/)[^/]+\//, `$1${size}/`);
}
