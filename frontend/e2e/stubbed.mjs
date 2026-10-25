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
  check("Search (error fixture): loading state has ended and no raw details show", !/Searching for/.test(text) && !(await isBusy()) && !/Bad Gateway|"status"/.test(text));

  await browser.stubResponses([]);
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\nAll stubbed checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
