// Accessibility audit of every route with axe-core (WCAG 2.1 A / AA rules) at phone, small phone and desktop
// widths, plus a keyboard pass: skip link, focus visibility and the page metadata of each route.
// Run against the running application; exits with code 1 when anything is found. See e2e/README.md.
import fs from "node:fs";
import { createRequire } from "node:module";

import { launch, sleep } from "./browser.mjs";

const axeSource = fs.readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const routes = [
  ["home", "/"],
  ["trending", "/browse/trending"],
  ["collection", "/browse/star-wars"],
  ["notfound-collection", "/browse/nope"],
  ["search", "/?q=batman"],
  ["pick", "/pick"],
  ["watchlist", "/watchlist"],
  ["about", "/about"],
  ["details", "/movies/603"],
  ["details-404", "/movies/abc"],
  ["404", "/does-not-exist"],
];
const widths = [
  [320, 700, true],
  [390, 844, true],
  [1440, 900, false],
];
const only = process.env.E2E_ROUTES?.split(",");

const browser = await launch();
let problems = 0;

try {
  for (const [name, route] of routes.filter(([routeName]) => !only || only.includes(routeName))) {
    for (const [width, height, mobile] of widths) {
      await browser.resize(width, height, mobile);
      await browser.go(route, 6000);
      await browser.evaluate(axeSource);

      const result = JSON.parse(
        await browser.evaluate(`axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }).then((r) => JSON.stringify({
          violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, count: v.nodes.length, sample: v.nodes[0].target.join(' ').slice(0, 90), help: v.help })),
          title: document.title,
          description: document.querySelector('meta[name=description]')?.content ?? null,
          og: document.querySelector('meta[property="og:image"]')?.content ?? null,
          lang: document.documentElement.lang,
        }))`),
      );

      const metadataIssues = [];

      if (!result.description) {
        metadataIssues.push("no meta description");
      }

      if (!result.og) {
        metadataIssues.push("no og:image");
      }

      if (/^(404:|Create Next App)/.test(result.title)) {
        metadataIssues.push(`default title "${result.title}"`);
      }

      problems += result.violations.length + metadataIssues.length;

      for (const issue of metadataIssues) {
        console.log(`      metadata: ${issue}`);
      }

      console.log(`${result.violations.length ? "FAIL" : "PASS"}  ${name}@${width}  title="${result.title}"`);

      for (const violation of result.violations) {
        console.log(`      ${violation.impact} ${violation.id} x${violation.count}: ${violation.help}  e.g. ${violation.sample}`);
      }
    }
  }

  // Keyboard: Tab through each route; the first stop must be the skip link and every stop needs a name and a
  // visible focus indicator (outline or ring).
  for (const [name, route] of [
    ["home", "/"],
    ["search", "/?q=batman"],
    ["pick", "/pick"],
    ["watchlist", "/watchlist"],
    ["details", "/movies/603"],
  ].filter(([routeName]) => !only || only.includes(routeName))) {
    await browser.resize(1440, 900);
    await browser.go(route, 6000);

    const stops = [];
    const startedOnBody = await browser.evaluate("document.activeElement === document.body");

    for (let index = 0; index < 25; index++) {
      await browser.send("Input.dispatchKeyEvent", { key: "Tab", code: "Tab", type: "rawKeyDown", windowsVirtualKeyCode: 9 });
      await browser.send("Input.dispatchKeyEvent", { key: "Tab", code: "Tab", type: "keyUp", windowsVirtualKeyCode: 9 });
      await sleep(300);
      stops.push(
        JSON.parse(
          await browser.evaluate(`(() => {
            const el = document.activeElement;
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
            const hasRing = style.boxShadow !== 'none';
            return JSON.stringify({
              tag: el.tagName.toLowerCase(),
              name: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').split(' ').filter(Boolean).join(' ').trim().slice(0, 40),
              // Poster cards draw their focus ring as an SVG outline inside the link.
              visibleFocus: hasOutline || hasRing || [...el.querySelectorAll('svg')].some((svg) => getComputedStyle(svg).opacity === '1'),
              onScreen: rect.width > 0 && rect.height > 0,
            });
          })()`),
        ),
      );
    }

    const issues = [];

    // A page that moves focus into its own field on load (Search) legitimately starts past the skip link.
    if (startedOnBody && !/skip/i.test(stops[0].name)) {
      issues.push(`first Tab stop is "${stops[0].name}", not the skip link`);
    }

    for (const stop of stops) {
      if (stop.tag === "body") {
        continue;
      }

      if (!stop.name) {
        issues.push(`<${stop.tag}> has no accessible name`);
      }

      if (!stop.visibleFocus) {
        issues.push(`<${stop.tag}> "${stop.name}" shows no focus indicator`);
      }
    }

    problems += issues.length;
    console.log(`${issues.length ? "FAIL" : "PASS"}  keyboard ${name}: ${stops.length} stops`);

    for (const issue of [...new Set(issues)].slice(0, 6)) {
      console.log(`      ${issue}`);
    }
  }
} finally {
  await browser.close();
}

console.log(problems === 0 ? "\nNo accessibility violations." : `\n${problems} violation group(s).`);
process.exit(problems === 0 ? 0 : 1);
