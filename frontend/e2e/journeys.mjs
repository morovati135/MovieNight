// End-to-end user journeys through the real frontend and backend (and live TMDB data).
// Start the backend and the frontend first; see e2e/README.md. Exits with code 1 if any check fails.
import { launch, sleep } from "./browser.mjs";

const browser = await launch();
let failures = 0;

function check(name, condition, detail = "") {
  if (!condition) {
    failures++;
  }

  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${detail ? `  [${detail}]` : ""}`);
}

const click = (predicateSource) =>
  browser.evaluate(`(() => { const el = [...document.querySelectorAll('button')].find(${predicateSource}); if (!el) return false; el.click(); return true; })()`);

try {
  await browser.resize(1440, 900);

  // Home
  await browser.go("/", 5000);
  let text = await browser.text();
  check("Home: hero, Trending and Popular present", /Trending Now/.test(text) && /Popular Movies/.test(text));
  check(
    "Home: Discover by Genre, Collections and Iconic sections exist",
    ["Discover by Genre", "Collections", "Iconic"].every((heading) => text.includes(heading)),
  );
  check("Home: no Your Watchlist row while the list is empty", !/Your Watchlist/.test(text));

  // Save from a Home card, then see it on the Watchlist page.
  const saved = await click(`(b) => /add .* to watchlist|add to watchlist/i.test(b.getAttribute('aria-label') || '')`);
  await sleep(2000);
  check("Home: a card's Watchlist button can be clicked", saved);
  await browser.go("/watchlist", 4000);
  text = await browser.text();
  check("Watchlist: shows the saved movie", /1 movie waiting/.test(text));

  // Details
  const detailsHref = await browser.evaluate(`document.querySelector('a[href^="/movies/"]')?.getAttribute('href')`);
  await browser.go(detailsHref ?? "/movies/603", 7000);
  text = await browser.text();
  check("Details: title, Cast and similar movies", /Cast/.test(text) && /Similar|More like|You may also/i.test(text), detailsHref ?? "");

  // Search
  await browser.go("/?q=batman", 5000);
  check("Search: results for a title", /movies? found for/.test(await browser.text()));
  await browser.go("/?q=batman&genre=28", 5000);
  check("Search: title plus genre narrows the results", /fit|found for/.test(await browser.text()));
  await browser.go("/?q=zzzzqqqxxx", 4500);
  check("Search: an empty result shows a friendly message", /No movies match/.test(await browser.text()));

  // Pick for Me
  await browser.go("/pick", 4000);
  const picked = await click(`(b) => /Pick a movie/i.test(b.textContent)`);
  // The reveal waits for the movie's artwork (up to a few seconds with a cold TMDB), so poll rather than guess.
  let revealed = false;

  for (let attempt = 0; attempt < 15 && picked && !revealed; attempt++) {
    await sleep(2000);
    revealed = /Tonight's ticket|Pick again|View Details/i.test(await browser.text());
  }

  check("Pick: the button works and a movie is revealed", picked && revealed);

  // Remove, undo window, empty state
  await browser.go("/watchlist", 4000);
  await browser.evaluate(`document.querySelector('[data-remove-button]')?.click()`);
  await sleep(2000);
  check("Watchlist: Remove offers Undo", /Undo/.test(await browser.text()));
  await sleep(6500);
  text = await browser.text();
  check("Watchlist: empty state after removal", /Discover movies|Pick for Me/.test(text) && !/waiting for movie night/.test(text));

  // Backend down
  await browser.blockUrls(["http://localhost:5080/*", "*/backend/*"]);
  await browser.go("/", 6000);
  text = await browser.text();
  check(
    "Error: Home with the backend down shows a friendly error and no raw details",
    /try again|couldn’t|could not|unavailable/i.test(text) && !/ProblemDetails|rfc9110|"status"|Exception/.test(text),
  );
  await browser.screenshot("error-home");
  await browser.go("/movies/603", 5000);
  text = await browser.text();
  check("Error: Details with the backend down shows a friendly state", /try again|couldn’t|unavailable|unable/i.test(text) && !/rfc9110|Exception/.test(text));
  await browser.blockUrls([]);

  // Not found
  await browser.go("/movies/abc", 3500);
  check("Not found: an invalid movie id", /couldn’t find that movie/i.test(await browser.text()));
  await browser.go("/zzz", 3000);
  check("Not found: an unknown route", /404/.test(await browser.text()));

  // Integration
  await browser.go("/", 5000);
  const direct = await browser.evaluate(`performance.getEntriesByType('resource').filter((e) => /api\\.themoviedb/.test(e.name)).length`);
  check("Integration: the browser never calls api.themoviedb.org", direct === 0);
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\nAll journeys passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
