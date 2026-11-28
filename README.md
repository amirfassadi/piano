# NUANCE

NUANCE is a bilingual Persian/English piano-score discovery project with URL-backed catalog filters, persistent favorites, and an original interactive practice study. It uses Next.js 16, React 19 and TypeScript. The discovery baseline's 32 catalog entries are retained; one additional, explicitly authored NUANCE exercise brings the catalog to 33. That sample is not presented as a published composition or credited to a real-world composer.

## Requirements and setup

Use **Node.js 22 LTS** (minimum supported by this checkout: Node 20.9) and npm 10 or newer. With nvm, run `nvm install` and `nvm use` from this project directory; `.nvmrc` selects Node 22. Then install the exact lockfile dependencies:

```sh
npm ci
```

For the browser acceptance test, install Playwright's Chromium browser once:

```sh
npx playwright install chromium
```

On a fresh Linux machine that also needs the browser's system libraries, use `npx playwright install --with-deps chromium`. A system Chromium can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium` (the test detects `/usr/bin/chromium` automatically when present).

## Run and verify

```sh
npm run dev
```

The acceptance script expects a production build. Run the required checks in this order:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm run test:e2e` starts and stops a local production server automatically on port 4173. Set `E2E_PORT` to choose a different port, or set `BASE_URL` to use an already-running server (in that case the script does not manage its lifecycle). The test uses Playwright Core and Chromium.

## Routes and features

The score library is at `/scores`; score details are at `/sheet/:slug`. The original practice sample is `/sheet/nuance-sample`, with the interactive two-hand practice room at `/practice/nuance-sample`. Discovery includes URL-synchronized search, category and difficulty filters, browser Back/Forward restoration, and favorites that persist through local storage with an in-memory fallback when storage is unavailable. Unknown arrangement-specific difficulty remains unknown rather than being guessed.

The practice room presents a four-measure authored study using one event collection for notation, the time-vertical/pitch-horizontal waterfall, keyboard highlights, and Web Audio synthesis. It supports play, pause, resume, seeking, tempo changes, hand toggles, and fractional A–B looping; music notation remains left-to-right regardless of the site's Persian interface direction. Unit tests cover the timing/layout helpers. Production-Chromium E2E wraps the real `AudioContext` and `OscillatorNode.start()`/`stop()` methods and asserts mid-note seek/resume, 100%→50%→150% retiming, remaining scheduled durations, no duplicate/overlapping voices, independent hand muting, fractional loops, error cleanup, and AudioContext teardown on route exit. DOM assertions compare the rendered score cursor, note positions, waterfall playhead, and keyboard pitch centers at event boundaries. These checks verify the browser's scheduled audio-clock calls, not sound emitted by a physical output device; hardware/loopback audio synchronization and perceived speaker/headphone output have not been measured. External MIDI is not asserted. There is no microphone or performance-detection feature.

## Service limitations

Authentication, payments, complete score/PDF delivery, support submission, and score-request submission are not connected. Scores other than the original practice study continue to show illustrative preview material rather than complete, verified notation or source recordings. Set `NEXT_PUBLIC_SITE_URL` to the canonical origin when preparing a deployment; without it, canonical URLs and sitemap entries are omitted. This task makes no production deployment.
