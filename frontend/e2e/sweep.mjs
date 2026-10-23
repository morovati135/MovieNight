// Visits every route at small phone, phone, tablet and desktop widths and reports layout and console problems:
// horizontal overflow, missing h1, broken images, tiny touch targets, console errors and failed requests.
// Exits with code 1 if any page has a problem. See e2e/README.md.
import { launch, sleep } from "./browser.mjs";

const allRoutes = [
  ["home", "/"],
  ["trending", "/browse/trending"],
  ["popular", "/browse/popular"],
  ["iconic", "/browse/iconic"],
  ["collection", "/browse/star-wars"],
  ["notfound-collection", "/browse/nope", [404]],
  ["search", "/?q=batman"],
  ["pick", "/pick"],
  ["watchlist", "/watchlist"],
  ["about", "/about"],
  ["details", "/movies/603"],
  ["details-404", "/movies/abc", [404]],
  ["404", "/does-not-exist", [404]],
];
// E2E_ROUTES=home,details runs only those routes.
const only = process.env.E2E_ROUTES?.split(",");
const routes = only ? allRoutes.filter(([name]) => only.includes(name)) : allRoutes;
const widths = [
  [320, 700, true],
  [390, 844, true],
  [768, 1024, false],
  [1440, 900, false],
];

const browser = await launch();
let problems = 0;

try {
  for (const [name, route, expectedStatuses = []] of routes) {
    for (const [width, height, mobile] of widths) {
      await browser.resize(width, height, mobile);
      await browser.go(route, 5000);
      // Scroll through so lazy sections load.
      await browser.evaluate(`(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); })()`);
      await sleep(2500);

      const page = JSON.parse(
        await browser.evaluate(`JSON.stringify({
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          h1Count: document.querySelectorAll('h1').length,
          // Hidden images (such as the Hero's inactive slides) are not shown to anyone, so they are not counted.
          brokenImages: [...document.images].filter((i) => i.getClientRects().length > 0 && i.complete && i.naturalWidth === 0 && i.currentSrc).length,
          smallTargets: [...document.querySelectorAll('a,button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 40) && getComputedStyle(e).visibility !== 'hidden'; }).length,
        })`),
      );
      const { consoleErrors, failedRequests } = browser.problems();
      const unexpectedRequests = failedRequests.filter((request) => !expectedStatuses.some((status) => request.startsWith(String(status))));
      const failed = page.overflow || page.h1Count !== 1 || page.brokenImages > 0 || page.smallTargets > 0 || unexpectedRequests.length > 0 || consoleErrors.some((error) => !error.includes("status of 404"));

      problems += failed ? 1 : 0;
      console.log(
        `${failed ? "FAIL" : "PASS"}  ${name}@${width}  overflow=${page.overflow} h1=${page.h1Count} brokenImages=${page.brokenImages} smallTargets=${page.smallTargets} consoleErrors=${consoleErrors.length} failedRequests=${JSON.stringify(unexpectedRequests)}`,
      );
    }
  }
} finally {
  await browser.close();
}

console.log(problems === 0 ? "\nEvery route is clean." : `\n${problems} page(s) have problems.`);
process.exit(problems === 0 ? 0 : 1);
