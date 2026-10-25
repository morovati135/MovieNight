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

  await browser.stubResponses([]);
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\nAll stubbed checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
