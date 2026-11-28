import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";

const managedServer = !process.env.BASE_URL;
const port = Number(process.env.E2E_PORT ?? 4173);
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${port}`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
let server;
if (managedServer) {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: "ignore", env: process.env });
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Next.js server exited before E2E started (code ${server.exitCode}). Run npm run build first.`);
    try { const response = await fetch(baseURL); if (response.ok) { ready = true; break; } } catch { /* server is still starting */ }
    await delay(500);
  }
  if (!ready) { server.kill("SIGTERM"); throw new Error(`Next.js server did not become ready at ${baseURL}. Run npm run build first.`); }
}
const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {}),
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.getByRole("button", { name: "تغییر زبان به انگلیسی" }).click();
  await page.waitForFunction(() => document.documentElement.lang === "en");

  await page.goto(`${baseURL}/scores`);
  await page.locator("#collection-search").fill("havas");
  await page.locator("#collection-search").press("Enter");
  await page.waitForFunction(() => new URLSearchParams(location.search).get("q") === "havas");
  assert.equal(await page.locator('.collection-score-grid a[href="/sheet/havas"]').count(), 1, "Havas search should show its real catalog record");

  await page.getByRole("button", { name: "Intermediate", exact: true }).click();
  await page.waitForFunction(() => new URLSearchParams(location.search).get("difficulty") === "متوسط");
  assert.equal(await page.locator('.collection-score-grid a[href="/sheet/havas"]').count(), 1, "the medium filter should include Havas from its easy-to-hard range");
  await page.goBack();
  await page.waitForFunction(() => !new URLSearchParams(location.search).has("difficulty"));
  await page.goForward();
  await page.waitForFunction(() => new URLSearchParams(location.search).get("difficulty") === "متوسط");

  await page.goto(`${baseURL}/scores`);
  await page.locator(".collection-filter-set").getByRole("button", { name: "Classical", exact: true }).click();
  await page.waitForFunction(() => new URLSearchParams(location.search).get("category") === "کلاسیک");
  assert.equal(await page.locator('.collection-score-grid a[href^="/sheet/"]').count(), 2, "the classical collection should contain two real scores");
  await page.locator(".collection-filter-set").getByRole("button", { name: "Film scores", exact: true }).click();
  await page.waitForFunction(() => new URLSearchParams(location.search).get("category") === "موسیقی فیلم");
  assert.equal(await page.locator('.collection-score-grid a[href^="/sheet/"]').count(), 7, "the film collection should contain seven real scores");
  await page.goBack();
  await page.waitForFunction(() => new URLSearchParams(location.search).get("category") === "کلاسیک");
  assert.equal(await page.locator('.collection-filter-set button[aria-pressed="true"]').innerText(), "Classical");
  assert.equal(await page.locator('.collection-score-grid a[href^="/sheet/"]').count(), 2);
  await page.goForward();
  await page.waitForFunction(() => new URLSearchParams(location.search).get("category") === "موسیقی فیلم");
  assert.equal(await page.locator('.collection-filter-set button[aria-pressed="true"]').innerText(), "Film scores");
  assert.equal(await page.locator('.collection-score-grid a[href^="/sheet/"]').count(), 7);

  await page.goto(`${baseURL}/scores`);
  await page.locator(".collection-score-grid button[aria-label^='Save']").first().click();
  assert.equal(await page.locator(".favorite-button span").innerText(), "1", "header count should update after saving a score");
  assert.equal(await page.evaluate(() => localStorage.getItem("nuance-saved-scores")), '["havas"]');
  await page.reload();
  await page.waitForFunction(() => document.querySelector(".favorite-button span")?.textContent === "1");
  assert.equal(await page.locator(".favorite-button span").innerText(), "1", "saved state should survive reload");
  await page.locator(".favorite-button").click();
  await page.waitForFunction(() => new URLSearchParams(location.search).get("saved") === "1");
  assert.equal(await page.locator('.collection-score-grid a[href^="/sheet/"]').count(), 1, "the header heart should open the saved-only view");
  await page.locator(".collection-score-grid button").first().click();
  await page.locator(".empty-state").waitFor();
  assert.match(await page.locator(".empty-state").innerText(), /no saved scores yet/i);
  assert.equal(await page.locator(".favorite-button span").innerText(), "0");

  await page.goto(`${baseURL}/sheet/havas`);
  await page.locator(".detail-favorite").click();
  assert.equal(await page.locator(".favorite-button span").innerText(), "1", "detail-page save should update the shared header state");
  await page.locator(".detail-favorite").click();
  assert.equal(await page.locator(".favorite-button span").innerText(), "0");

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(baseURL);
  await page.getByRole("button", { name: "Switch language to Persian" }).click();
  await page.waitForFunction(() => document.documentElement.lang === "fa");
  const mobilePersian = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, lang: document.documentElement.lang }));
  assert.ok(mobilePersian.scrollWidth <= mobilePersian.width + 1, `Persian mobile layout overflows: ${JSON.stringify(mobilePersian)}`);
  await page.getByRole("button", { name: "تغییر زبان به انگلیسی" }).click();
  await page.waitForFunction(() => document.documentElement.lang === "en");
  const mobileEnglish = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, lang: document.documentElement.lang }));
  assert.ok(mobileEnglish.scrollWidth <= mobileEnglish.width + 1, `English mobile layout overflows: ${JSON.stringify(mobileEnglish)}`);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${baseURL}/scores`);
  const desktop = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(desktop.scrollWidth <= desktop.width + 1, `desktop layout overflows: ${JSON.stringify(desktop)}`);

  await page.goto(`${baseURL}/sheet/nuance-sample`);
  await page.waitForFunction(() => document.documentElement.lang === "en");
  assert.equal(await page.locator('a[href="/practice/nuance-sample"]').count(), 1, "the authored sample should lead to its interactive practice route");
  await page.locator('a[href="/practice/nuance-sample"]').click();
  await page.waitForURL("**/practice/nuance-sample");
  assert.equal(await page.locator("main.practice-page").getAttribute("dir"), "ltr", "music order remains LTR even inside the Persian-capable shell");
  assert.equal(await page.locator(".practice-staff .bar-line").count(), 10, "the four-measure score has five bar boundaries on each staff, not a fifth measure");
  await page.getByRole("button", { name: "Waterfall", exact: true }).click();
  assert.equal(await page.locator(".waterfall-note").count(), 24, "the waterfall renders each pitched arrangement event from the score event list");
  const firstNote = await page.locator(".waterfall-note").first().evaluate((node) => ({ left: node.style.left, top: node.style.top, height: node.style.height }));
  assert.match(firstNote.left, /%$/);
  assert.match(firstNote.top, /calc\(/);
  assert.ok(firstNote.height.endsWith("px"), "note duration is represented by vertical length");
  await page.getByRole("button", { name: "Start or resume" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).waitFor();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const seek = page.locator("#position-slider");
  await seek.focus();
  for (let i = 0; i < 45; i += 1) await seek.press("ArrowRight");
  assert.ok(Number(await seek.inputValue()) > 1, "seek can move to a nonzero mid-piece position");
  const tempo = page.locator("#tempo-percent");
  await tempo.focus(); await tempo.press("ArrowRight");
  assert.equal(await tempo.inputValue(), "101", "tempo control changes without changing the pitch setting");
  const rightHand = page.getByRole("button", { name: "Right hand", exact: true });
  await rightHand.click();
  assert.equal(await rightHand.getAttribute("aria-pressed"), "false", "hand toggles expose their actual mute state");
  await seek.focus();
  for (let i = 0; i < 45; i += 1) await seek.press("ArrowRight");
  const loopButtons = page.locator(".ab-loop button");
  await loopButtons.nth(0).click();
  for (let i = 0; i < 30; i += 1) await seek.press("ArrowRight");
  await loopButtons.nth(1).click();
  assert.equal(await loopButtons.nth(0).getAttribute("aria-pressed"), "true", "A-B controls become active after marking a valid loop");
  await loopButtons.nth(2).click();
  assert.equal(await loopButtons.nth(0).getAttribute("aria-pressed"), "false", "the loop can be cleared");
  await seek.focus(); await seek.press("End");
  assert.equal(Number(await seek.inputValue()), 16, "seek can reach the piece endpoint");
  await page.getByRole("button", { name: "Start or resume" }).click();
  await page.waitForFunction(() => Number(document.querySelector("#position-slider")?.value) < 0.1 && document.querySelector(".practice-controls .primary-button")?.getAttribute("aria-label") === "Pause", { timeout: 3_000 });
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Start or resume" }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.getByRole("button", { name: "Start or resume" }).waitFor();
  console.log("Practice E2E passed: authored route/link, LTR music order, four measures, shared events, time-vertical duration, audio start/pause, seek, tempo, hand mute and A-B controls.");
  await context.close();

  const deniedContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await deniedContext.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() { throw new DOMException("Storage is blocked", "SecurityError"); },
    });
  });
  const deniedPage = await deniedContext.newPage();
  await deniedPage.goto(`${baseURL}/scores`);
  await deniedPage.locator('.collection-score-grid a[href^="/sheet/"]').first().waitFor();
  await deniedPage.locator(".collection-score-grid button").first().click();
  assert.equal(await deniedPage.locator(".favorite-button span").innerText(), "1", "the page and in-memory favorites should work when storage is denied");
  await deniedContext.close();
  console.log("E2E passed: search, shared difficulty, category history, saved persistence/empty state, detail favorites, denied storage, bilingual mobile, and desktop overflow.");
} finally {
  await browser.close();
  if (server && server.exitCode === null) server.kill("SIGTERM");
}
