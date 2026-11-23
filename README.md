# NUANCE

NUANCE is a bilingual piano-score library built with Next.js, React, TypeScript, and Tailwind CSS. Its editorial design supports Persian RTL and English LTR layouts, with score discovery, collections, artist browsing, and local preview controls.

## Development

```sh
npm install
npm run dev
```

Quality checks:

```sh
npm run lint
npm run typecheck
npm run build
```

## Routes and features

The App Router includes the home catalog, score and artist collections, support and song-request information, account and membership pages, and `/sheet/:slug` score details. The local catalog powers search, category and difficulty filters, favorites, related scores, and the synthesized preview.

## Service limitations

Authentication, payment, complete score/PDF delivery, support submission, and song-request submission are not connected. Score notation and playback are illustrative previews. Set `NEXT_PUBLIC_SITE_URL` to the canonical site origin before deployment; without a configured origin the sitemap remains empty.
