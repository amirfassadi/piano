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
async function setRangeValue(page, selector, value) {
  await page.locator(selector).evaluate((el, next) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(next));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await page.waitForFunction(({ selector: target, expected }) => Math.abs(Number(document.querySelector(target)?.value) - expected) < 0.001, { selector, expected: value });
}
const midiHz = (midi) => 440 * 2 ** ((midi - 69) / 12);
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

  await context.addInitScript(() => {
    const probe = { nodes: [], contexts: [], closedContexts: 0, failAfter: 0, createCount: 0 };
    Object.defineProperty(window, "__nuanceAudioProbe", { configurable: false, value: probe });
    const proto = window.AudioContext?.prototype;
    if (!proto) return;
    const create = proto.createOscillator;
    proto.createOscillator = function () {
      probe.createCount += 1;
      if (probe.failAfter && probe.createCount >= probe.failAfter) throw new Error("synthetic oscillator start failure");
      const node = create.call(this);
      const record = { pitch: 0, starts: [], stops: [], contextId: probe.contexts.length };
      probe.nodes.push(record);
      const start = node.start.bind(node);
      const stop = node.stop.bind(node);
      node.start = (when = this.currentTime) => { record.pitch = node.frequency.value; record.starts.push({ when, now: this.currentTime }); return start(when); };
      node.stop = (when = this.currentTime) => { record.stops.push({ when, now: this.currentTime }); return stop(when); };
      return node;
    };
    const resume = proto.resume;
    proto.resume = function () {
      if (!probe.contexts.includes(this)) probe.contexts.push(this);
      return resume.call(this);
    };
    const close = proto.close;
    proto.close = function () { probe.closedContexts += 1; return close.call(this); };
  });
  await page.goto(`${baseURL}/sheet/nuance-sample`);
  await page.waitForFunction(() => document.documentElement.lang === "en");
  assert.equal(await page.locator('a[href="/practice/nuance-sample"]').count(), 1, "the authored sample should lead to its interactive practice route");
  await page.locator('a[href="/practice/nuance-sample"]').click();
  await page.waitForURL("**/practice/nuance-sample");
  assert.equal(await page.locator("main.practice-page").getAttribute("dir"), "ltr", "music order remains LTR even inside the Persian-capable shell");
  assert.equal(await page.locator(".practice-staff .bar-line").count(), 10, "the four-measure score has five bar boundaries on each staff, not a fifth measure");
  const openingAlignment = await page.evaluate(() => ({ noteX: document.querySelector('.score-note[data-event-id="r1"] ellipse')?.getAttribute("cx"), cursorX: document.querySelector(".score-cursor")?.getAttribute("x1") }));
  assert.equal(openingAlignment.cursorX, openingAlignment.noteX, "the drawn staff cursor and event onset share the same mapped x coordinate");
  await page.getByRole("button", { name: "Waterfall", exact: true }).click();
  assert.equal(await page.locator(".waterfall-note").count(), 24, "the waterfall renders each pitched arrangement event from the score event list");
  const firstNote = await page.locator(".waterfall-note").first().evaluate((node) => ({ left: node.style.left, top: node.style.top, height: node.style.height }));
  assert.match(firstNote.left, /%$/);
  assert.match(firstNote.top, /calc\(/);
  assert.ok(firstNote.height.endsWith("px"), "note duration is represented by vertical length");
  const waterfallAtOnset = await page.evaluate(() => {
    const note = document.querySelector('.waterfall-note[data-event-id="r1"]');
    const cursor = document.querySelector(".waterfall-cursor");
    const key = document.querySelector('.white-key[title="C4"]');
    const box = (element) => { const rect = element.getBoundingClientRect(); return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }; };
    return { note: box(note), cursor: box(cursor), key: box(key), waterfall: box(document.querySelector(".waterfall")), keyboard: box(document.querySelector(".piano-keyboard")) };
  });
  assert.ok(Math.abs((waterfallAtOnset.note.top + waterfallAtOnset.note.height) - waterfallAtOnset.cursor.top) < 2, "waterfall note tail meets playhead at its onset");
  assert.ok(Math.abs((waterfallAtOnset.note.left + waterfallAtOnset.note.width / 2 - waterfallAtOnset.waterfall.left) / waterfallAtOnset.waterfall.width - (waterfallAtOnset.key.left + waterfallAtOnset.key.width / 2 - waterfallAtOnset.keyboard.left) / waterfallAtOnset.keyboard.width) < 0.02, "waterfall pitch center aligns with the corresponding keyboard key");
  await setRangeValue(page, "#position-slider", 0.5);
  const waterfallAtMidpoint = await page.evaluate(() => {
    const note = document.querySelector('.waterfall-note[data-event-id="r1"]');
    const cursor = document.querySelector(".waterfall-cursor");
    const noteRect = note.getBoundingClientRect(); const cursorRect = cursor.getBoundingClientRect();
    return { note: { top: noteRect.top, height: noteRect.height, current: note.classList.contains("current") }, cursorY: cursorRect.top + cursorRect.height / 2, rightKey: document.querySelector('.white-key[title="C4"]')?.className, leftKey: document.querySelector('.white-key[title="C3"]')?.className };
  });
  assert.equal(waterfallAtMidpoint.note.current, true, "the waterfall note is marked current during its event interval");
  assert.ok(Math.abs(waterfallAtMidpoint.note.top + waterfallAtMidpoint.note.height / 2 - waterfallAtMidpoint.cursorY) < 2, "at beat 0.5 the playhead crosses the middle of the one-beat waterfall block");
  assert.match(waterfallAtMidpoint.rightKey, /right/, "the matching C4 keyboard key highlights the active right-hand note");
  assert.match(waterfallAtMidpoint.leftKey, /left/, "the matching C3 keyboard key highlights the active sustained left-hand note");
  await page.getByRole("button", { name: "Standard score", exact: true }).click();
  await setRangeValue(page, "#position-slider", 1);
  await page.waitForFunction(() => document.querySelector('.score-note[data-event-id="r2"]')?.classList.contains("active"));
  const beatOneAlignment = await page.evaluate(() => ({ noteX: document.querySelector('.score-note[data-event-id="r2"] ellipse')?.getAttribute("cx"), cursorX: document.querySelector(".score-cursor")?.getAttribute("x1") }));
  assert.equal(beatOneAlignment.cursorX, beatOneAlignment.noteX, "at beat one the drawn cursor is over the corresponding staff note");
  await setRangeValue(page, "#position-slider", 0);
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

  const audioPage = await context.newPage();
  await audioPage.goto(`${baseURL}/practice/havas`);
  assert.equal(await audioPage.locator(".practice-controls").count(), 0, "a score without a valid authored arrangement has no fabricated practice controls");
  await audioPage.goto(`${baseURL}/practice/nuance-sample`);
  await setRangeValue(audioPage, "#position-slider", 0.5);
  let baseNodeCount = await audioPage.evaluate(() => window.__nuanceAudioProbe.nodes.length);
  await audioPage.getByRole("button", { name: "Start or resume" }).click();
  await audioPage.waitForFunction((base) => {
    const nodes = window.__nuanceAudioProbe.nodes.slice(base);
    const pitches = nodes.filter((node) => node.starts.length).map((node) => node.pitch);
    return [48, 60, 67].every((midi) => pitches.some((hz) => Math.abs(hz - 440 * 2 ** ((midi - 69) / 12)) < 0.5));
  }, baseNodeCount);
  let midSeekVoices = await audioPage.evaluate((base) => window.__nuanceAudioProbe.nodes.slice(base).filter((node) => node.starts.length), baseNodeCount);
  for (const midi of [48, 60, 67]) {
    const voice = midSeekVoices.find((node) => Math.abs(node.pitch - midiHz(midi)) < 0.5);
    assert.ok(voice, `seek at beat 0.5 schedules the overlapping ${midi} note/chord tone`);
    assert.equal(midSeekVoices.filter((node) => Math.abs(node.pitch - midiHz(midi)) < 0.5).length, 1, `mid-note seek must not create parallel ${midi} oscillators`);
    const expected = (midi === 48 ? 1.5 : 0.5) * 60 / 84;
    assert.ok(Math.abs(voice.stops[0].when - voice.starts[0].when - expected) < 0.035, `oscillator stop time for MIDI ${midi} equals the actual remaining beat duration`);
  }
  const beforePause = Number(await audioPage.locator("#position-slider").inputValue());
  assert.ok(beforePause >= 0.5 && beforePause < 1, "mid-note seek remains inside the sustained chord and left-hand note");
  await audioPage.getByRole("button", { name: "Pause", exact: true }).click();
  const stoppedMidSeekVoices = await audioPage.evaluate(() => window.__nuanceAudioProbe.nodes.filter((node) => node.starts.length));
  baseNodeCount = await audioPage.evaluate(() => window.__nuanceAudioProbe.nodes.length);
  await audioPage.getByRole("button", { name: "Start or resume" }).click();
  await audioPage.waitForFunction((base) => window.__nuanceAudioProbe.nodes.slice(base).some((node) => node.pitch > 120 && node.pitch < 140 && node.starts.length), baseNodeCount);
  const resumedVoices = await audioPage.evaluate((base) => window.__nuanceAudioProbe.nodes.slice(base).filter((node) => node.starts.length), baseNodeCount);
  assert.ok([48, 60, 67].every((midi) => resumedVoices.some((node) => Math.abs(node.pitch - midiHz(midi)) < 0.5)), "resume inside active events recreates both chord tones and sustained left-hand voice");
  for (const midi of [48, 60, 67]) {
    const oldVoice = stoppedMidSeekVoices.find((node) => Math.abs(node.pitch - midiHz(midi)) < 0.5);
    const newVoice = resumedVoices.find((node) => Math.abs(node.pitch - midiHz(midi)) < 0.5);
    assert.ok(newVoice.starts[0].when >= oldVoice.stops.at(-1).when - 0.001, `resume does not overlap the previous MIDI ${midi} voice (old stop ${oldVoice.stops.at(-1).when}, new start ${newVoice.starts[0].when})`);
  }

  const retimeBase = await audioPage.evaluate(() => window.__nuanceAudioProbe.nodes.length);
  await setRangeValue(audioPage, "#position-slider", 0.5);
  await audioPage.waitForFunction((base) => window.__nuanceAudioProbe.nodes.slice(base).some((node) => Math.abs(node.pitch - 261.625565) < 0.5 && node.starts.length), retimeBase);
  baseNodeCount = await audioPage.evaluate(() => window.__nuanceAudioProbe.nodes.length);
  const before50 = Number(await audioPage.locator("#position-slider").inputValue());
  await setRangeValue(audioPage, "#tempo-percent", 50);
  await audioPage.waitForFunction((base) => window.__nuanceAudioProbe.nodes.slice(base).some((node) => node.starts.length), baseNodeCount);
  const at50 = await audioPage.evaluate((base) => window.__nuanceAudioProbe.nodes.slice(base).filter((node) => node.starts.length), baseNodeCount);
  assert.ok(at50.some((node) => Math.abs(node.pitch - midiHz(60)) < 0.5), "100%→50% retiming reschedules the active right-hand note at the same pitch");
  const endedAt50 = await audioPage.evaluate((base) => window.__nuanceAudioProbe.nodes.slice(0, base).filter((node) => node.starts.length && node.stops.length > 1 && node.stops.at(-1).when < node.stops[0].when), baseNodeCount);
  assert.ok(endedAt50.length > 0, "tempo change schedules real stop calls for old active oscillator resources");
  for (const oldVoice of endedAt50) {
    const replacement = at50.find((node) => Math.abs(node.pitch - oldVoice.pitch) < 0.5);
    if (replacement) assert.ok(replacement.starts[0].when >= oldVoice.stops.at(-1).when - 0.001, "50% retiming leaves no parallel old/new voice overlap");
  }
  const rightAt50 = at50.findLast((node) => Math.abs(node.pitch - midiHz(60)) < 0.5);
  const beatAt50 = Number(await audioPage.locator("#position-slider").inputValue());
  assert.ok(beatAt50 >= before50 - 0.05 && beatAt50 - before50 < 0.4, "100%→50% retiming preserves the current beat without a transport jump");
  assert.ok(Math.abs((rightAt50.stops[0].when - rightAt50.starts[0].when) - (1 - beatAt50) * 60 / 42) < 0.09, `50% schedule uses remaining beats at new tempo (duration ${rightAt50.stops[0].when - rightAt50.starts[0].when}, slider beat ${beatAt50})`);

  baseNodeCount = await audioPage.evaluate(() => window.__nuanceAudioProbe.nodes.length);
  await setRangeValue(audioPage, "#tempo-percent", 150);
  await audioPage.waitForFunction(() => document.querySelector(".tempo-label strong")?.textContent?.includes("150%"));
  await audioPage.waitForFunction((base) => window.__nuanceAudioProbe.nodes.slice(base).some((node) => node.starts.length), baseNodeCount);
  const at150 = await audioPage.evaluate((base) => window.__nuanceAudioProbe.nodes.slice(base).filter((node) => node.starts.length), baseNodeCount);
  assert.ok(at150.some((node) => Math.abs(node.pitch - midiHz(60)) < 0.5), "50%→150% retiming preserves pitch while scheduling a replacement voice");
  const endedAt150 = await audioPage.evaluate((base) => window.__nuanceAudioProbe.nodes.slice(0, base).filter((node) => node.starts.length && node.stops.length > 1 && node.stops.at(-1).when < node.stops[0].when), baseNodeCount);
  assert.ok(endedAt150.length > 0, "150% retiming issues real early-stop calls for old sources");
  for (const oldVoice of endedAt150) {
    const replacement = at150.findLast((node) => Math.abs(node.pitch - oldVoice.pitch) < 0.5);
    if (replacement) assert.ok(replacement.starts[0].when >= oldVoice.stops.at(-1).when - 0.001, "150% retiming leaves no parallel old/new voice overlap");
  }
  const rightAt150 = at150.findLast((node) => Math.abs(node.pitch - midiHz(60)) < 0.5);
  const beatAt150 = Number(await audioPage.locator("#position-slider").inputValue());
  assert.ok(Math.abs((rightAt150.stops[0].when - rightAt150.starts[0].when) - (1 - beatAt150) * 60 / 126) < 0.09, `150% schedule uses remaining beats at new tempo (duration ${rightAt150.stops[0].when - rightAt150.starts[0].when}, slider beat ${beatAt150}, voices ${JSON.stringify(at150)})`);

  baseNodeCount = await audioPage.evaluate(() => window.__nuanceAudioProbe.nodes.length);
  await setRangeValue(audioPage, "#tempo-percent", 100);
  await audioPage.waitForFunction(() => document.querySelector(".tempo-label strong")?.textContent?.includes("100%"));
  await audioPage.waitForFunction((base) => window.__nuanceAudioProbe.nodes.slice(base).some((node) => Math.abs(node.pitch - 261.625565) < 0.5 && node.starts.length), baseNodeCount);
  const muteReseekBase = await audioPage.evaluate(() => window.__nuanceAudioProbe.nodes.length);
  await setRangeValue(audioPage, "#position-slider", 0.5);
  await audioPage.waitForFunction((base) => [130.812783, 261.625565, 391.995436].every((pitch) => window.__nuanceAudioProbe.nodes.slice(base).some((node) => Math.abs(node.pitch - pitch) < 0.5 && node.starts.length)), muteReseekBase);

  const rightHandButton = audioPage.getByRole("button", { name: "Right hand", exact: true });
  const leftHandButton = audioPage.getByRole("button", { name: "Left hand", exact: true });
  const muteTime = await audioPage.evaluate(() => window.__nuanceAudioProbe.contexts.at(-1).currentTime);
  await rightHandButton.click();
  assert.equal(await rightHandButton.getAttribute("aria-pressed"), "false", "right-hand control mutes only the right hand");
  await audioPage.waitForFunction((time) => window.__nuanceAudioProbe.nodes.some((node) => Math.abs(node.pitch - 261.625565) < 0.5 && node.stops.at(-1).now >= time), muteTime);
  const leftVoiceAfterRightMute = await audioPage.evaluate((time) => window.__nuanceAudioProbe.nodes.findLast((node) => Math.abs(node.pitch - 130.812783) < 0.5 && node.stops.at(-1)?.now < time && node.stops.at(-1)?.when > time), muteTime);
  assert.ok(leftVoiceAfterRightMute, "right-hand mute leaves the active left-hand oscillator running");
  const leftMuteTime = await audioPage.evaluate(() => window.__nuanceAudioProbe.contexts.at(-1).currentTime);
  await leftHandButton.click();
  assert.equal(await leftHandButton.getAttribute("aria-pressed"), "false", "left-hand control mutes independently");
  await audioPage.waitForFunction((time) => window.__nuanceAudioProbe.nodes.some((node) => Math.abs(node.pitch - 130.812783) < 0.5 && node.stops.at(-1).now >= time), leftMuteTime);

  const cleanupBase = await audioPage.evaluate(() => ({ closed: window.__nuanceAudioProbe.closedContexts, context: window.__nuanceAudioProbe.contexts.at(-1), nodes: window.__nuanceAudioProbe.nodes.length }));
  await audioPage.locator('a[href="/scores"]').first().click();
  await audioPage.waitForURL("**/scores");
  await audioPage.waitForFunction((closed) => window.__nuanceAudioProbe.closedContexts > closed, cleanupBase.closed);
  assert.ok(await audioPage.evaluate((base) => window.__nuanceAudioProbe.nodes.slice(0, base.nodes).filter((node) => node.starts.length).every((node) => node.stops.length > 0), cleanupBase), "leaving the practice route stops all created oscillator resources and closes its AudioContext");
  await audioPage.close();

  const loopPage = await context.newPage();
  await loopPage.goto(`${baseURL}/practice/nuance-sample`);
  await loopPage.getByRole("button", { name: "Right hand", exact: true }).click();
  await setRangeValue(loopPage, "#position-slider", 0.5);
  await loopPage.locator(".ab-loop button").nth(0).click();
  await setRangeValue(loopPage, "#position-slider", 1.5);
  await loopPage.locator(".ab-loop button").nth(1).click();
  assert.match(await loopPage.locator(".ab-loop").innerText(), /A 0\.5[\s\S]*B 1\.5/);
  baseNodeCount = await loopPage.evaluate(() => window.__nuanceAudioProbe.nodes.length);
  await loopPage.getByRole("button", { name: "Start or resume" }).click();
  await loopPage.waitForFunction((base) => window.__nuanceAudioProbe.nodes.slice(base).filter((node) => Math.abs(node.pitch - 130.812783) < 0.5 && node.starts.length).length >= 2, baseNodeCount, { timeout: 4_000 });
  const loopVoices = await loopPage.evaluate((base) => window.__nuanceAudioProbe.nodes.slice(base).filter((node) => Math.abs(node.pitch - 130.812783) < 0.5 && node.starts.length), baseNodeCount);
  assert.equal(loopVoices.filter((node) => node.starts[0].when - loopVoices[0].starts[0].when < 0.08).length, 1, "each loop cycle schedules only one active sustained-note voice");
  assert.ok(Math.abs(loopVoices[0].stops[0].when - loopVoices[0].starts[0].when - 60 / 84) < 0.035, "fractional A–B boundary at beat 1.5 truncates the sustained left note to one remaining beat");
  assert.ok(Math.abs(loopVoices[1].stops[0].when - loopVoices[1].starts[0].when - 60 / 84) < 0.035, "the sustained note is restored with the same remaining loop duration on the next pass");
  assert.ok(loopVoices[0].stops[0].when <= loopVoices[1].starts[0].when + 0.001, "the loop restart restores the sustained note at A without parallel playback");
  const loopCleanup = await loopPage.evaluate(() => {
    const now = window.__nuanceAudioProbe.contexts.at(-1).currentTime;
    const active = window.__nuanceAudioProbe.nodes.map((node, index) => ({ index, stops: node.stops.length, pitch: node.pitch })).filter((node) => Math.abs(node.pitch - 130.812783) < 0.5 && window.__nuanceAudioProbe.nodes[node.index].stops.at(-1).when > now + 0.1);
    return { closed: window.__nuanceAudioProbe.closedContexts, now, nodes: window.__nuanceAudioProbe.nodes.length, active };
  });
  assert.ok(loopCleanup.active.length > 0, "a currently sustained loop voice remains scheduled before route cleanup");
  await loopPage.locator('a[href="/scores"]').first().click();
  await loopPage.waitForURL("**/scores");
  await loopPage.waitForFunction((closed) => window.__nuanceAudioProbe.closedContexts > closed, loopCleanup.closed);
  assert.ok(await loopPage.evaluate((active) => active.every(({ index, stops }) => { const calls = window.__nuanceAudioProbe.nodes[index].stops; return calls.length > stops && calls.at(-1).now >= calls.at(-1).when - 0.001; }), loopCleanup.active), "unmount replaces each active loop voice's future stop with an immediate resource stop");
  await loopPage.close();

  const errorPage = await context.newPage();
  await errorPage.goto(`${baseURL}/practice/nuance-sample`);
  await errorPage.evaluate(() => { window.__nuanceAudioProbe.failAfter = 2; });
  baseNodeCount = await errorPage.evaluate(() => window.__nuanceAudioProbe.nodes.length);
  await errorPage.getByRole("button", { name: "Start or resume" }).click();
  await errorPage.getByRole("status").filter({ hasText: "Audio could not start" }).waitFor();
  const failedStart = await errorPage.evaluate((base) => window.__nuanceAudioProbe.nodes.slice(base), baseNodeCount);
  assert.ok(failedStart.length >= 1 && failedStart.every((node) => node.stops.length >= 2), "a failed partial start tears down already-created oscillators after the scheduling error");
  assert.equal(await errorPage.getByRole("button", { name: "Start or resume" }).count(), 1, "the failed start returns the UI to a retryable paused state");
  await errorPage.close();
  console.log("Audio E2E passed: actual OscillatorNode starts/stops for beat-0.5 seek/resume, 100/50/150% retiming, independent hand muting, fractional A–B continuation, startup failure and route cleanup. These are browser audio-clock schedules, not measured audible output.");
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
