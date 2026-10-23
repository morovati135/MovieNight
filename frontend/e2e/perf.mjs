// Page-load measurements on the running application (use a production build: `npm run build && npm start`).
// For each route and width it reports first / largest contentful paint, the time the page settled,
// cumulative layout shift (CLS), image requests, transferred bytes and failed image requests, with the browser cache disabled.
import { launch, sleep } from "./browser.mjs";

const routes = (process.env.E2E_ROUTES ?? "/,/browse/trending,/movies/603,/watchlist,/pick").split(",");
const widths = [
  [390, 844, true],
  [1440, 900, false],
];

const browser = await launch();
const rows = [];

try {
  await browser.send("Network.setCacheDisabled", { cacheDisabled: true });

  for (const route of routes) {
    for (const [width, height, mobile] of widths) {
      await browser.resize(width, height, mobile);
      await browser.go("/about", 500);
      await browser.go(route, 0);
      await sleep(9000);

      const paint = JSON.parse(
        await browser.evaluate(`new Promise((resolve) => {
          const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null;
          let lcp = null;
          let cls = 0;
          new PerformanceObserver((list) => { lcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve(JSON.stringify({ fcp, lcp, cls })), 100);
        })`),
      );
      const events = browser.rawEvents();
      const urls = new Map();

      for (const event of events) {
        if (event.method === "Network.requestWillBeSent") {
          urls.set(event.params.requestId, { type: event.params.type, url: event.params.request.url });
        }
      }

      let bytes = 0;
      let imageBytes = 0;
      let images = 0;

      for (const event of events) {
        if (event.method === "Network.loadingFinished") {
          bytes += event.params.encodedDataLength;

          if (urls.get(event.params.requestId)?.type === "Image") {
            imageBytes += event.params.encodedDataLength;
            images++;
          }
        }
      }

      const failedImages = events.filter(
        (event) => event.method === "Network.responseReceived" && event.params.type === "Image" && event.params.response.status >= 400,
      ).length;

      rows.push({
        route,
        width,
        "FCP ms": Math.round(paint.fcp ?? -1),
        "LCP ms": Math.round(paint.lcp ?? -1),
        CLS: Math.round(paint.cls * 1000) / 1000,
        images,
        "image KB": Math.round(imageBytes / 1024),
        "total KB": Math.round(bytes / 1024),
        failedImages,
      });
    }
  }
} finally {
  await browser.close();
}

console.table(rows);
