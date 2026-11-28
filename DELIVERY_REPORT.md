# NUANCE Discovery + Interactive Practice — Implementation Report

## Release and baseline

This is follow-up release **1.0.1** on the dedicated branch `feat/interactive-piano-practice`. It builds on the discovery ZIP accepted by the earlier task; the stale `NUANCE-source.zip` was not treated as the final source. The 32 discovery records and their search/filter/URL/history/favorite/storage behavior remain. One clearly authored NUANCE exercise brings the catalog to 33; it is not presented as a published work or attributed to a real-world composer.

From the recoverable prior project files and the previous “NUANCE Prompt Manuscript” session, the practice event model, authored event set, transport helpers, initial practice-room component, and base tests were recovered. A complete practice checkout and the formerly reported branch refs were not available in the original repository recovery. The practice route, responsive styling, score-detail/catalog linkage, coordinate mapping, and additional regression/browser tests had to be reconstructed. The recovered practice code was retained and improved rather than replaced wholesale.

## Practice implementation and corrections

The practice route is `/practice/nuance-sample`, linked from `/sheet/nuance-sample`. One authored event list drives staff notes, score cursor, pitch/time waterfall, virtual-keyboard highlights, and Web Audio synthesis. Four measures are shown; music notation stays LTR in Persian and English layouts. The practice route is only provided for the piece with a valid authored arrangement.

The follow-up corrects waterfall placement so each note block moves across the execution line during its actual `[start, end]` duration. It also fixes mid-note scheduling and deduplication: seek, pause/resume, and fractional A–B entry schedule the remaining portion of sustained notes/chords, and a stable per-event/transport key prevents repeatedly scheduling a new oscillator on each scheduler tick. Tempo changes preserve the current beat, stop the old source on an explicit short fade boundary, and schedule its replacement at the new BPM; source stop calls match sliced event ends. Per-hand mute, partial-start errors, and route unmount clean up source nodes; unmount also closes the AudioContext.

Discovery remains covered by URL-backed search, inclusive difficulty matching (including medium for easy-to-hard), category filters, Back/Forward restoration, saved favorites across reload, unrelated query-parameter preservation, and in-memory fallback if storage is blocked.

## Verification and archive reproducibility

Release archive: `delivery/NUANCE-Interactive-Practice-v1.0.1.zip`. It passed `zip -T` and contains the complete 46-file project source, including the practice route, components, libraries, tests, configuration, `package.json`, and synchronized `package-lock.json`. The exact ZIP was extracted into a previously nonexistent directory, `/home/ubuntu/work/piano-release-1.0.1-clean`. All checks below were run from that extracted copy:

- `npm ci` — passed; 372 packages installed, zero vulnerabilities reported; `package.json` and lockfile both identify 1.0.1.
- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed, **18/18** tests.
- `npm run build` — passed on Next.js 16.4.6; `/practice/nuance-sample` was generated as a static route.
- `npm run test:e2e` — passed against a local production server in Chromium.
- `git diff --check` — passed on the development changes.

The unit suite covers arrangement validation, transport/slicing helpers, loops, tempo conversions, score/pitch geometry, catalog discovery, URL handling, and storage. Production-browser E2E instruments actual Chromium `AudioContext` and oscillator `start()`/`stop()` calls. It checks beat-0.5 seek/resume through a chord and sustained left-hand note, actual scheduled stop durations at 100%→50%→150%, no duplicate/parallel voices, stop/start order during retiming, independent hand muting, a fractional A–B loop truncating and restoring a sustained note, cleanup after a synthetic partial-start failure, and resource/context cleanup on client-side route exit. DOM-level assertions compare score cursor and event x-coordinates, waterfall crossing at onset and midpoint, and waterfall pitch centers with the corresponding keyboard keys. Discovery UI scenarios exercise search, filters, history, favorites, storage fallback, and responsive layouts.

`npm ci` emitted a non-blocking deprecation notice for installed ESLint 9.39.5. Node also emitted non-blocking `MODULE_TYPELESS_PACKAGE_JSON` notices while executing the TypeScript tests. No vulnerability was reported. These E2E assertions verify **browser-scheduled audio-clock calls** only; they do not measure sound heard through speakers/headphones, physical or loopback output, MIDI devices, or perceived audio/visual synchronization. Browser/device-specific audible latency is unverified. No microphone or performance-detection feature exists.

## Remaining product limitations

Authentication, payment, complete score/PDF delivery, support submission, and score-request submission are not connected to a service. Scores other than the original practice study may still show illustrative previews rather than complete verified notation or source recordings. This task does not deploy to production.

See the versioned supplementary delivery report for the archive SHA-256, source commit identity, and remote-push verification.
