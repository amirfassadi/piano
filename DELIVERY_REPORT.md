# NUANCE Discovery + Interactive Practice — Delivery Report

## Recovery and baseline

The accepted baseline is `NUANCE-discovery-qa.zip`; the older `NUANCE-source.zip` was not treated as final. Its 32 catalog records were preserved. A complete practice checkout and the previously reported remote refs were unavailable. From the prior NUANCE Prompt Manuscript conversation and recoverable project files, the practice data model/authored events, transport helpers, initial practice-room component and base tests were recovered. These recovered code pieces were retained and corrected.

The practice route and its styling were absent from the recovered archives, so `/app/practice/nuance-sample/page.tsx`, responsive styling, catalog/detail linkage, shared visual coordinates, and new regression/E2E coverage were reconstructed from the recovered model and existing project. The only catalog addition is an explicitly identified original NUANCE sample exercise; no published work or performer credit was fabricated. Total catalog count: 33 (32 existing + 1 authored study).

## Implemented scope

The practice room now uses one authored event collection for staff notes/cursor, time-vertical and pitch-horizontal waterfall, keyboard highlights, and synthesized playback. The staff cursor and beat positions share a linear beat transform; key/pitch columns use common MIDI coordinates; note-block length follows duration. Four measures are shown (with the terminal barline, not an extra fifth measure), and the music layout remains LTR inside both Persian and English site shells.

Playback scheduling supports pause/resume and seeking into a sustained note, tempo changes while playing, per-hand enable/mute based on the explicit `hand` field, chord events, restart at the endpoint, A–B loop boundaries, completion, and pausing on background visibility changes. Discovery retains range-aware difficulty matching (including medium for easy-to-hard items), URL-backed state and Back/Forward, unrelated query parameters, favorites across reload, and in-memory fallback if browser storage is blocked.

## Verification

The final release archive is `NUANCE-Interactive-Practice.zip`. It is extracted to a new, empty directory and the following commands are run against that extracted copy; the final supplementary report records exact outcomes and archive SHA-256:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`

The unit suite tests event slicing, timing transforms, loop math, hand-field gating, beat/pitch coordinates, duration geometry, catalog difficulty, URL preservation, and storage parsing. E2E checks the score-detail-to-practice route, LTR music order, four-measure staff, shared pitched events, waterfall duration, playback start/pause, seek, tempo, hand toggles, A–B controls, endpoint restart, background pause, search/category/Back/Forward, favorite persistence/fallback, and responsive layout.

**Audio limitation:** these checks validate scheduling logic and browser controls only. They do not measure physical or loopback audio output, speaker/headphone latency, external MIDI, or perceptual synchronization. Hardware/output synchronization is not confirmed. There is no microphone or performance-detection capability.

Authentication, payment, complete score/PDF delivery and service-backed form submission remain outside this local package. Nothing is deployed. Work is isolated to `feat/interactive-piano-practice`; `main` and production remain unchanged.
