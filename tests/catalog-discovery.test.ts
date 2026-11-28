import test from "node:test";
import assert from "node:assert/strict";
import { ALL_DIFFICULTIES, difficultyLevels, matchesDifficulty } from "../lib/catalog-filters.ts";
import { parseCatalogUrlSearch, updateCatalogUrl } from "../lib/catalog-url.ts";
import { parseSavedScores, serializeSavedScores } from "../lib/favorites.ts";
import { scores } from "../lib/catalog.ts";

test("shared difficulty matching expands inclusive range labels exactly", () => {
  assert.deepEqual(difficultyLevels("آسان تا سخت"), ["آسان", "متوسط", "سخت"]);
  assert.deepEqual(difficultyLevels("آسان تا متوسط"), ["آسان", "متوسط"]);
  assert.deepEqual(difficultyLevels("متوسط تا سخت"), ["متوسط", "سخت"]);
  assert.equal(matchesDifficulty("آسان تا سخت", "متوسط"), true);
  assert.equal(matchesDifficulty("آسان تا متوسط", "سخت"), false);
  assert.equal(matchesDifficulty("متوسط تا سخت", "آسان"), false);
  assert.equal(matchesDifficulty("متوسط", "سخت"), false);
  assert.equal(matchesDifficulty("آسان تا سخت", ALL_DIFFICULTIES), true);
});

test("arrangement-dependent difficulty remains unknown instead of matching a guessed level", () => {
  assert.deepEqual(difficultyLevels("انتخاب تنظیم"), []);
  assert.equal(matchesDifficulty("انتخاب تنظیم", "آسان"), false);
  assert.equal(matchesDifficulty("انتخاب تنظیم", "متوسط"), false);
  assert.equal(matchesDifficulty("انتخاب تنظیم", "سخت"), false);
  assert.equal(matchesDifficulty("انتخاب تنظیم", ALL_DIFFICULTIES), true);
});

test("the real Havas catalog record is discoverable under the medium filter", () => {
  const havas = scores.find((score) => score.slug === "havas");
  assert.ok(havas);
  assert.equal(matchesDifficulty(havas.level, "متوسط"), true);
});

test("preserves 32 discovery records and adds only one clearly authored sample", () => {
  assert.equal(scores.length, 33);
  assert.equal(new Set(scores.map((score) => score.slug)).size, 33);
  const sample = scores.find((score) => score.slug === "nuance-sample");
  assert.ok(sample);
  assert.match(sample.artist, /تألیفی/);
  assert.equal(sample.category, "تمرین‌های تألیفی");
  assert.equal(scores.filter((score) => score.slug !== "nuance-sample").length, 32);
});

test("catalog URL parsing and updates preserve unrelated parameters and encode Persian values", () => {
  assert.deepEqual(parseCatalogUrlSearch("?q=Havas&category=%DA%A9%D9%84%D8%A7%D8%B3%DB%8C%DA%A9&difficulty=%D9%85%D8%AA%D9%88%D8%B3%D8%B7&saved=1"), {
    q: "Havas", category: "کلاسیک", difficulty: "متوسط", saved: true,
  });
  const href = updateCatalogUrl("/scores", "?ref=home&q=old", "#catalog", { q: "هوس", category: "کلاسیک", difficulty: "متوسط", saved: false });
  assert.equal(href, "/scores?ref=home&q=%D9%87%D9%88%D8%B3&category=%DA%A9%D9%84%D8%A7%D8%B3%DB%8C%DA%A9&difficulty=%D9%85%D8%AA%D9%88%D8%B3%D8%B7#catalog");
  assert.deepEqual(parseCatalogUrlSearch(""), { q: "", category: "", difficulty: "", saved: false });
});

test("saved-score storage parsing tolerates malformed, unavailable, duplicate, and stale entries", () => {
  const valid = ["havas", "fur-elise"];
  assert.deepEqual(parseSavedScores(null, valid), []);
  assert.deepEqual(parseSavedScores("not-json", valid), []);
  assert.deepEqual(parseSavedScores("{}", valid), []);
  assert.deepEqual(parseSavedScores('["havas","havas","removed",4,"fur-elise"]', valid), ["havas", "fur-elise"]);
  assert.equal(serializeSavedScores(["havas", "removed", "havas"], valid), '["havas"]');
});
