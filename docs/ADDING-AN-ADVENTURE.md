# Adding an adventure

Each adventure is a folder: `content/adventures/<slug>/` (data) + `public/adventures/<slug>/` (photos).
The site lists every folder that has a `meta.json` and a `summary.json`; the highest `order` shows first.

## 1. Get the rides

### Option A — Garmin (automatic, what `alps-2026` uses)

1. Create a personal key: Garmin Connect → Settings → *Personal API token* (<https://connect.garmin.com/app/settings/personalApiToken>).
2. Put it in `.env.local` (never committed):
   ```
   GARMIN_PERSONAL_API_KEY=GCDC_...
   ```
3. Download the original files of a date range:
   ```
   node scripts/garmin-fetch.mjs 2026-07-30 2026-08-07
   ```
   This writes `data-raw/garmin/activities.json` and one `<activityId>.zip` (FIT) per ride.
   Remove from `data-raw/garmin/` anything that does not belong to the adventure.

The FIT file carries everything the site uses: GPS track, altitude, heart rate, speed, temperature, calories (and power / cadence when a sensor is paired).

### Option B — Strava (manual export)

For each activity on strava.com (desktop site, your own activities only):

1. Open the activity → **⋯** (left column, under the title) → **Export Original** — this downloads the original `.fit` with heart rate, temperature, etc.
   **Export GPX** also works but drops part of the sensor data; prefer *Export Original*.
2. Bulk alternative: Settings → *My Account* → *Download or Delete Your Account* → *Request your archive* (all activities, by e-mail).

The build script currently reads the Garmin layout (`activities.json` + zipped FIT). Loose Strava exports need a small adapter — not written yet.

## 2. Build the site data

```
node scripts/build-adventure.mjs <slug>     # FIT → days/*.json + summary.json, weather, place names
node scripts/name-passes.mjs <slug>         # optional: names high points from OpenStreetMap
node scripts/apply-overrides.mjs <slug>     # applies overrides.json (manual pass / place names)
node scripts/build-terrain.mjs <slug>       # real relief for the 3D cube view + the scroll map (public/adventures/<slug>/terrain/)
node scripts/build-towns.mjs <slug>         # candidate towns along each stage → towns.json (then keep only the main ones by hand)
```

Rides on the same calendar day are merged into one stage.

## 3. Describe it

`content/adventures/<slug>/meta.json`:

```json
{
  "order": 2,
  "riders": 2,
  "title":   { "en": "…", "fr": "…" },
  "tagline": { "en": "…", "fr": "…" },
  "intro":   { "en": "…", "fr": "…" },
  "sport":   { "en": "Road cycling", "fr": "Cyclisme sur route" }
}
```

## 4. Photos and notes

```
public/adventures/<slug>/cover.jpg
public/adventures/<slug>/day-01/*.jpg      ← any number, shown in file-name order
content/adventures/<slug>/notes/day-01.en.md
content/adventures/<slug>/notes/day-01.fr.md
```

Keep photos reasonably light (≈ 2000 px wide, < 500 KB) — they are served as-is.
Commit and push: Vercel redeploys automatically.

## Photos, videos and the dots on the route

Drop files in `public/adventures/<slug>/day-NN/` (jpg, png, webp, mp4, webm, mov). Each one becomes a blinking dot
on the day's 3D route (hover = preview) and a tile in the Photos panel. Where the dot goes, in order of trust:

1. `km042` in the file name (`km042_stelvio-sommet.jpg` → kilometre 42 of that day);
2. the GPS position stored in the photo (straight from a phone, not re-exported by a messaging app);
3. its capture time (camera clock assumed on CEST);
4. otherwise the files are spread evenly along the day, in file-name order.

Cover of the adventure: `public/adventures/<slug>/cover.jpg`.

## meta.json extras

- `"kind"`: `bike`, `run`, `ski` or `hike` — the pictogram shown instead of the sport's name.
- `"massKg"`: rider + bike + bags, used by the power estimate (there is no power meter; see `src/lib/ride.ts`).

## Minimap

`node scripts/build-terrain.mjs <slug> --minimap` rebuilds only `terrain/minimap.json` (wide frame, coast, lakes, cities).
A full run of `build-terrain.mjs` rebuilds it too.
