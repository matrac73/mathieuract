# mathieuract.vercel.app

Personal website of Mathieu Ract — profile, projects, articles and cycling adventures.
Next.js (App Router) · TypeScript · plain CSS · deployed on Vercel.

```
npm install
npm run dev        # http://localhost:3000  (redirects to /en or /fr)
npm run build
```

## Where things live

| What | Where |
|---|---|
| Profile, CV, skills, contacts, project list | `src/content/site.ts` |
| UI strings (EN / FR) | `src/lib/i18n.ts` |
| Articles (one `.en.md` + one `.fr.md` per slug) | `content/articles/` |
| Adventures (data, notes) | `content/adventures/<slug>/` |
| Adventure photos | `public/adventures/<slug>/` |
| Design tokens (colours, fonts) | top of `src/app/globals.css` |

Language: the first visit is routed by geo-IP (`src/middleware.ts`, French-speaking countries → `/fr`, everything else → `/en`); the EN/FR switch stores a cookie that takes over afterwards.

## Filling an adventure

- **Photos of a day** — drop `.jpg / .png / .webp` files into `public/adventures/alps-2026/day-06/`. They replace the empty slots automatically, in file-name order.
- **Cover photo** — `public/adventures/alps-2026/cover.jpg`.
- **Notes of a day** — write Markdown in `content/adventures/alps-2026/notes/day-06.en.md` (and `.fr.md`).
- **Title, tagline, intro** — `content/adventures/alps-2026/meta.json`.
- **Pass names / place names** — `content/adventures/alps-2026/overrides.json`, then `node scripts/apply-overrides.mjs alps-2026`.

Adding a whole new adventure: see [docs/ADDING-AN-ADVENTURE.md](docs/ADDING-AN-ADVENTURE.md).

## Data sources

- Rides: Garmin Connect Personal API (original FIT files; raw files stay local in `data-raw/`, git-ignored).
- Weather: [Open-Meteo](https://open-meteo.com) historical archive (ERA5 reanalysis), sampled along the route at the time of passage.
- Satellite: NASA GIBS (VIIRS daily true colour) and Sentinel-2 cloudless by EOX (CC BY-NC-SA 4.0, contains modified Copernicus Sentinel data).
- Place names: OpenStreetMap / Nominatim.
