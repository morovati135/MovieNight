// Minimal headless-browser driver over the Chrome DevTools Protocol (no extra dependencies).
// Uses Microsoft Edge or Google Chrome, whichever is installed (override with BROWSER_PATH).
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const baseUrl = (process.env.E2E_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const apiUrl = (process.env.E2E_API_URL ?? "http://localhost:5080").replace(/\/$/, "");
const shotsDir = process.env.E2E_SHOTS_DIR ?? path.join(os.tmpdir(), "movienight-e2e-shots");

const candidates = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Starts a fresh headless browser profile and returns helpers to drive its single tab. */
export async function launch({ port = 9400 + Math.floor(Math.random() * 400) } = {}) {
  const executable = candidates.find((candidate) => fs.existsSync(candidate));

  if (!executable) {
    throw new Error("No Edge or Chrome found. Set BROWSER_PATH to a Chromium-based browser.");
  }

  fs.mkdirSync(shotsDir, { recursive: true });

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "movienight-e2e-"));
  const process_ = spawn(executable, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], {
    stdio: "ignore",
  });

  let targets;

  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();

      if (targets.some((target) => target.type === "page")) {
        break;
      }
    } catch {
      // The browser is still starting.
    }

    await sleep(250);
  }

  const socket = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve) => (socket.onopen = resolve));

  let nextId = 0;
  const pending = new Map();
  let events = [];

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);

    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    } else if (data.method === "Fetch.requestPaused") {
      answerStubbedRequest(data.params);
    } else if (data.method) {
      events.push(data);
    }
  };

  // Static responses for requests matching a rule (see `stubResponses`); everything else continues untouched.
  let stubRules = [];

  async function answerStubbedRequest({ requestId, request }) {
    const rule = stubRules.find((candidate) => candidate.match.test(request.url));

    if (!rule) {
      send("Fetch.continueRequest", { requestId });
      return;
    }

    await sleep(rule.delayMs ?? 0);
    send("Fetch.fulfillRequest", {
      body: Buffer.from(JSON.stringify(rule.body)).toString("base64"),
      requestId,
      responseCode: rule.status ?? 200,
      responseHeaders: [
        { name: "Content-Type", value: rule.status >= 400 ? "application/problem+json" : "application/json" },
        { name: "Access-Control-Allow-Origin", value: "*" },
      ],
    });
  }

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++nextId;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");

  return {
    /** Runs JavaScript in the page and returns its value. */
    async evaluate(expression) {
      const response = await send("Runtime.evaluate", { awaitPromise: true, expression, returnByValue: true });

      if (response.result.exceptionDetails) {
        throw new Error(`Page script failed: ${JSON.stringify(response.result.exceptionDetails).slice(0, 300)}`);
      }

      return response.result.result.value;
    },
    async go(route, settleMs = 4000) {
      events = [];
      await send("Page.navigate", { url: `${baseUrl}${route}` });
      await sleep(settleMs);
    },
    resize: (width, height, mobile = false) =>
      send("Emulation.setDeviceMetricsOverride", { deviceScaleFactor: 1, height, mobile, width }),
    /** Raw DevTools events since the last navigation (for the performance script). */
    rawEvents: () => events,
    send,
    /**
     * Answers browser requests whose URL matches `match` (a RegExp) with a static JSON `body` (optionally a
     * `status` and a `delayMs`), so a check does not depend on live TMDB data. Pass `[]` to stop stubbing.
     */
    async stubResponses(rules) {
      stubRules = rules;
      await send(rules.length > 0 ? "Fetch.enable" : "Fetch.disable", rules.length > 0 ? { patterns: [{ urlPattern: "*" }] } : {});
    },
    blockUrls: (urls) => send("Network.setBlockedURLs", { urls }),
    /** Console errors, thrown exceptions and failed (>= 400) responses since the last navigation. */
    problems() {
      return {
        consoleErrors: events
          .filter(
            (event) =>
              event.method === "Runtime.exceptionThrown" ||
              (event.method === "Runtime.consoleAPICalled" && event.params.type === "error") ||
              (event.method === "Log.entryAdded" && event.params.entry.level === "error"),
          )
          .map((event) => JSON.stringify(event.params).slice(0, 160)),
        failedRequests: events
          .filter((event) => event.method === "Network.responseReceived" && event.params.response.status >= 400)
          .filter((event) => !event.params.response.url.includes("favicon"))
          .map((event) => `${event.params.response.status} ${event.params.response.url.slice(0, 100)}`),
      };
    },
    /** Saves a screenshot of the tab as `<dir>/<name>.<png|jpg>` (default folder: the temp shots folder). */
    async screenshot(name, { dir = shotsDir, format = "png", quality = 85 } = {}) {
      const shot = await send("Page.captureScreenshot", { format, ...(format === "jpeg" ? { quality } : {}) });

      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${name}.${format === "jpeg" ? "jpg" : "png"}`), Buffer.from(shot.result.data, "base64"));
    },
    text: () => send("Runtime.evaluate", { expression: "document.body.innerText", returnByValue: true }).then((r) => r.result.result.value),
    async close() {
      socket.close();
      process_.kill();
      await sleep(500);

      try {
        fs.rmSync(profile, { force: true, recursive: true, maxRetries: 5 });
      } catch {
        // The browser may still hold the profile briefly; the OS cleans the temp folder later.
      }
    },
  };
}
