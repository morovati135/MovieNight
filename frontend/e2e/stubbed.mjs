// Deterministic browser checks: the browser's API responses are replaced by static fixtures, so the result
// does not depend on live TMDB data. The live checks stay in journeys.mjs. See e2e/README.md.
import { launch, sleep } from "./browser.mjs";

const browser = await launch();
let failures = 0;

function check(name, condition, detail = "") {
  if (!condition) {
    failures++;
  }

  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${detail ? `  [${detail}]` : ""}`);
}

const genres = { match: /\/api\/movies\/genres/, body: [{ id: 28, name: "Action" }] };
const emptySearch = { page: 1, results: [], totalPages: 0, totalResults: 0 };
const problem = (status, title) => ({ status, title, type: "about:blank" });
const rawDetails = /Bad Gateway|Not Found|"status"|Exception/;
const isBusy = () => browser.evaluate(`document.querySelector('[aria-busy="true"]') !== null`);

try {
  await browser.resize(1440, 900);

  // Search with no results: the loading state shows while the response is pending, then the friendly message.
  await browser.stubResponses([genres, { match: /\/api\/movies\/search/, body: emptySearch, delayMs: 1500 }]);
  await browser.go("/?q=anything", 700);
  let text = await browser.text();
  check("Search (empty fixture): loading state shows while the response is pending", /Searching for/.test(text) && (await isBusy()));
  await sleep(3000);
  text = await browser.text();
  check("Search (empty fixture): shows the “No movies match” message", /No movies match/.test(text));
  check("Search (empty fixture): loading state has ended", !/Searching for/.test(text) && !(await isBusy()));

  // Search that fails on the server: a friendly message with a retry, no raw error details.
  await browser.stubResponses([
    genres,
    { match: /\/api\/movies\/search/, status: 502, body: { status: 502, title: "Bad Gateway", type: "about:blank" } },
  ]);
  await browser.go("/?q=anything", 3500);
  text = await browser.text();
  check("Search (error fixture): shows a friendly message with a retry", /Search isn’t available right now/.test(text) && /try again|retry/i.test(text));
  check("Search (error fixture): loading state has ended and no raw details show", !/Searching for/.test(text) && !(await isBusy()) && !rawDetails.test(text));

  // Watchlist: an empty shelf and a failing load.
  await browser.stubResponses([{ match: /\/backend\/watchlist$/, body: [] }]);
  await browser.go("/watchlist", 3500);
  check("Watchlist (empty fixture): shows the empty shelf", /Your shelf is empty/.test(await browser.text()));
  await browser.stubResponses([{ match: /\/backend\/watchlist$/, status: 502, body: problem(502, "Bad Gateway") }]);
  await browser.go("/watchlist", 3500);
  text = await browser.text();
  check("Watchlist (error fixture): friendly message with a retry, no raw details", /couldn’t open your shelf/.test(text) && /Try again/.test(text) && !rawDetails.test(text));

  // Movie details: not found and a failing load.
  await browser.stubResponses([{ match: /\/api\/movies\/603$/, status: 404, body: problem(404, "Not Found") }]);
  await browser.go("/movies/603", 3500);
  text = await browser.text();
  check("Details (404 fixture): shows the not-found state", /couldn’t find that movie/.test(text) && !rawDetails.test(text));
  await browser.stubResponses([{ match: /\/api\/movies\/603$/, status: 502, body: problem(502, "Bad Gateway") }]);
  await browser.go("/movies/603", 3500);
  text = await browser.text();
  check("Details (error fixture): friendly message with a retry, no raw details", /couldn’t load this movie/.test(text) && /Try again/.test(text) && !rawDetails.test(text));

  // Browse: an empty list and a failing load.
  await browser.stubResponses([{ match: /\/api\/movies\/popular/, body: emptySearch, delayMs: 1500 }]);
  await browser.go("/browse/popular", 700);
  check("Browse (empty fixture): loading state shows while the response is pending", await isBusy());
  await sleep(3000);
  check("Browse (empty fixture): shows the empty message and the loading state ends", /There are no movies here yet/.test(await browser.text()) && !(await isBusy()));
  await browser.stubResponses([{ match: /\/api\/movies\/popular/, status: 502, body: problem(502, "Bad Gateway") }]);
  await browser.go("/browse/popular", 3500);
  text = await browser.text();
  check("Browse (error fixture): friendly message with a retry, no raw details", /couldn’t be loaded right now/.test(text) && /Try again/.test(text) && !rawDetails.test(text));

  // Pick for Me: nothing matches, and a failing pick.
  const pickWith = async (rule) => {
    await browser.stubResponses([genres, rule]);
    await browser.go("/pick", 3500);
    await browser.evaluate(`[...document.querySelectorAll('button')].find((b) => /Pick a movie/i.test(b.textContent))?.click()`);
    await sleep(6000);
    return browser.text();
  };
  text = await pickWith({ match: /\/api\/movies\/pick/, status: 404, body: problem(404, "Not Found") });
  check("Pick (no-match fixture): says nothing fits and offers to loosen", /Nothing fits all of that/.test(text) && !rawDetails.test(text));
  text = await pickWith({ match: /\/api\/movies\/pick/, status: 502, body: problem(502, "Bad Gateway") });
  check("Pick (error fixture): friendly message with a retry, no raw details", /couldn’t pick a movie right now/.test(text) && /Try again/.test(text) && !rawDetails.test(text));

  // Home: page-level empty and error states, then each lazy section failing or empty on its own.
  const movie = { backdropUrl: null, genreIds: [28], id: 1, overview: "A fixture film.", posterUrl: null, releaseDate: "2020-01-01", title: "Fixture Film", voteAverage: 7.5 };
  const onePage = { page: 1, results: [movie], totalPages: 1, totalResults: 1 };
  const failure = (match) => ({ body: problem(502, "Bad Gateway"), match, status: 502 });
  const homeBase = [
    { match: /\/api\/movies\/trending/, body: onePage },
    { match: /\/api\/movies\/popular/, body: onePage },
    { match: /\/api\/movies\/top-rated/, body: onePage },
    { match: /\/api\/movies\/discover/, body: onePage },
    { match: /\/api\/collections$/, body: [{ posterUrls: [], slug: "fixture", title: "Fixture Collection" }] },
    { match: /\/backend\/watchlist$/, body: [] },
    genres,
  ];
  const homeWith = async (...overrides) => {
    await browser.stubResponses([...overrides, ...homeBase]);
    await browser.go("/", 2500);

    // The lower sections load when they come near the viewport, so scroll down a screen at a time (a single jump to the bottom can skip a section).
    for (let step = 0; step < 14; step++) {
      await browser.evaluate("window.scrollBy(0, window.innerHeight * 0.7)");
      await sleep(500);
    }

    await sleep(1500);
    return browser.text();
  };

  text = await homeWith({ match: /\/api\/movies\/trending/, body: emptySearch });
  check("Home (empty trending fixture): shows “Nothing is showing yet” with Check again", /Nothing is showing yet/.test(text) && /Check again/.test(text));
  text = await homeWith(failure(/\/api\/movies\/trending/));
  check("Home (error fixture): friendly message with a retry, no raw details", /couldn’t load movies right now/.test(text) && /Try again/.test(text) && !rawDetails.test(text));
  text = await homeWith();
  check("Home (healthy fixtures): hero, sections and no error notices", /Fixture Film/.test(text) && /Fixture Collection|Collections/.test(text) && !/could not be loaded|couldn’t be loaded/.test(text));
  text = await homeWith(failure(/\/api\/collections$/));
  check("Home (collections error): only that section shows a retry", /Collections could not be loaded right now/.test(text) && /Discover by Genre/.test(text) && !rawDetails.test(text));
  text = await homeWith({ match: /\/api\/collections$/, body: [] });
  check("Home (no collections): the section is left out", !/Collections/.test(text) && /Discover by Genre/.test(text));
  text = await homeWith(failure(/\/api\/movies\/top-rated/));
  check("Home (iconic error): only that section shows a retry", /Top rated movies could not be loaded right now/.test(text) && !rawDetails.test(text));
  text = await homeWith({ match: /\/api\/movies\/top-rated/, body: emptySearch });
  check("Home (no top-rated movies): the section is left out", !/Iconic/.test(text) && /Discover by Genre/.test(text));
  text = await homeWith(failure(/\/api\/movies\/genres/));
  check("Home (genres error): the genre section shows a retry", /Genres could not be loaded right now/.test(text) && !rawDetails.test(text));
  text = await homeWith(failure(/\/api\/movies\/discover/));
  check("Home (genre movies error): says Action movies could not be loaded", /Action movies could not be loaded/.test(text) && !rawDetails.test(text));
  text = await homeWith({ match: /\/api\/movies\/discover/, body: emptySearch });
  check("Home (no genre movies): says there is nothing to show", /No Action movies to show right now/.test(text));
  text = await homeWith(failure(/\/backend\/watchlist$/));
  check("Home (watchlist error): the preview shows a retry while the rest of Home works", /Your watchlist could not be loaded right now/.test(text) && /Fixture Film/.test(text));

  await browser.stubResponses([]);
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\nAll stubbed checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
