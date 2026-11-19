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

## Importing photos and videos straight from the phone

```
node scripts/import-media.mjs <slug> <folder with the originals>     # add --dry to only see where each file would go
```

Needs `ffmpeg` on the PATH. For each file (HEIC, JPG, PNG, MOV, MP4) the script reads when and where it was taken,
picks the day and the spot on that day's route (GPS first, capture time otherwise), writes a web-sized JPEG — or a
3-second silent MP4 for a video — to `public/adventures/<slug>/day-NN/`, and records the result in
`content/adventures/<slug>/media.json`. The Live Photo clip that comes with a picture is ignored.

`media.json` is where the titles live (`title.fr` / `title.en`, shown under the picture) and where a position can be
corrected by hand (`at` = 0..1 along the day, `km` = what the caption says). Running the import again keeps the titles.

On the day page the photos scroll on the left, black and white until the rider reaches the place where they were taken;
the 3D map stays on the right and the orange trace follows.

### Corrections by hand

`content/adventures/<slug>/media-fixes.json`, keyed by the original file name, is applied by every import:

```json
{
  "IMG_0215.HEIC": { "skip": true },
  "IMG_7378.PNG":  { "day": "day-04", "time": "12:54" },
  "IMG_7415.MOV":  { "start": 0 },
  "IMG_7620.HEIC": { "blur": [[0.195, 0.248, 0.125, 0.112, 14]] }
}
```

`skip` leaves a file out; `day` + `time` place a file that lost its date or position (it goes where the route was at that
time); `start` says where a video's 3 seconds begin; `blur` softens zones (x, y, width, height as fractions of the picture,
then the strength). After changing `start` or `blur`, delete the converted file so the import makes it again.

## Several adventures side by side

Each adventure keeps its raw files in its own folder:

```
node scripts/garmin-fetch.mjs 2023-08-07 2023-08-13 garmin-<slug>      # a third argument: the folder under data-raw/
node scripts/garmin-fetch.mjs 2023-08-20 2023-08-23 garmin-<slug>      # a second range (an epilogue) is merged into it
node scripts/build-adventure.mjs <slug> [--from=YYYY-MM-DD] [--no-overpass]
```

`build-adventure` reads `data-raw/garmin-<slug>/` when it exists, keeps only the rides, and numbers the days by riding
day (rest days and gaps are not counted). `--no-overpass` skips the automatic pass names when the network blocks
Overpass: name them in `overrides.json` (`passes`, matched by detected altitude), where `days` can also rename the start
or the end of one day.

More `meta.json` keys: `riders` is optional; `"transfer": "train"` draws a little train on the unrecorded stretches
(without it they are plain dotted arcs, labelled "unrecorded stretch"); `"epilogue": 6` marks day 6 and the following
ones as an epilogue ridden later. Without a `cover.jpg` the cover frame is simply not shown.
