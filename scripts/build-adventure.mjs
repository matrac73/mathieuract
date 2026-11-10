// Turns raw Garmin FIT files (data-raw/garmin) into the JSON the site reads:
//   content/adventures/<slug>/summary.json  + days/day-NN.json
// and enriches each day with field data: named passes (OpenStreetMap/Overpass),
// hourly weather along the route (Open-Meteo archive) and place names (Nominatim).
// Usage: node scripts/build-adventure.mjs <slug>          (default: alps-2026)
import fs from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";
import FitParser from "fit-file-parser";

const Parser = FitParser.default ?? FitParser;
const slug = process.argv[2] ?? "alps-2026";
const RAW = path.join("data-raw", "garmin");
const OUT = path.join("content", "adventures", slug);
const N_PROFILE = 480;
const UA = { "User-Agent": "personal-site-build-script/1.0" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round = (v, n = 0) => (v == null || Number.isNaN(v) ? null : Math.round(v * 10 ** n) / 10 ** n);
const rad = (d) => (d * Math.PI) / 180;

function haversine(a, b) {
  const R = 6371000, dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function bearing(a, b) {
  const y = Math.sin(rad(b[1] - a[1])) * Math.cos(rad(b[0]));
  const x = Math.cos(rad(a[0])) * Math.sin(rad(b[0])) - Math.sin(rad(a[0])) * Math.cos(rad(b[0])) * Math.cos(rad(b[1] - a[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

async function parseFit(id) {
  const zip = new AdmZip(path.join(RAW, `${id}.zip`));
  const entry = zip.getEntries().find((x) => /\.fit$/i.test(x.entryName));
  const parser = new Parser({ force: true, speedUnit: "km/h", lengthUnit: "m", temperatureUnit: "celsius", elapsedRecordField: true, mode: "list" });
  return new Promise((res, rej) => parser.parse(entry.getData(), (err, d) => (err ? rej(err) : res(d))));
}

async function getJson(url, opts = {}, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(40000), headers: { ...UA, ...(opts.headers ?? {}) } });
      if (r.ok) return await r.json();
      if (i === tries - 1) throw new Error(`HTTP ${r.status} ${url.slice(0, 90)}`);
    } catch (e) {
      if (i === tries - 1) throw e;
    }
    await sleep(2500 * (i + 1));
  }
}

async function placeName(lat, lon) {
  try {
    const j = await getJson(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=12&accept-language=en&lat=${lat}&lon=${lon}`);
    await sleep(1100);
    const a = j.address ?? {};
    return { name: a.city ?? a.town ?? a.village ?? a.municipality ?? a.hamlet ?? j.name ?? null, country: (a.country_code ?? "").toUpperCase() };
  } catch (e) {
    console.warn("  nominatim failed:", e.message);
    return { name: null, country: "" };
  }
}

// --- peaks with topographic prominence, on the resampled profile -------------
function findPeaks(d, e, minProm = 220, minEle = 900) {
  const peaks = [];
  for (let i = 1; i < e.length - 1; i++) {
    if (e[i] < minEle) continue;
    let isMax = true;
    for (let k = Math.max(0, i - 12); k <= Math.min(e.length - 1, i + 12); k++) if (e[k] > e[i]) { isMax = false; break; }
    if (!isMax) continue;
    let lmin = e[i], rmin = e[i];
    for (let k = i - 1; k >= 0 && e[k] <= e[i]; k--) lmin = Math.min(lmin, e[k]);
    for (let k = i + 1; k < e.length && e[k] <= e[i]; k++) rmin = Math.min(rmin, e[k]);
    const prom = e[i] - Math.max(lmin, rmin);
    // a summit finish / start counts with one-sided prominence
    const oneSided = e[i] - Math.min(lmin, rmin);
    if (prom >= minProm || ((i < 14 || i > e.length - 15) && oneSided >= minProm * 1.5)) {
      if (!peaks.length || i - peaks[peaks.length - 1].i > 12) peaks.push({ i, km: d[i] / 1000, ele: e[i], gain: Math.round(e[i] - lmin) });
    }
  }
  return peaks;
}

async function namePasses(allPeaks) {
  if (!allPeaks.length) return;
  const q = `[out:json][timeout:60];(${allPeaks
    .map((p) => `node(around:2500,${p.lat},${p.lon})["mountain_pass"="yes"]["name"];node(around:2500,${p.lat},${p.lon})["natural"="saddle"]["name"];`)
    .join("")});out body;`;
  for (const host of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
    try {
      const j = await getJson(host, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "Content-Type": "application/x-www-form-urlencoded" } }, 2);
      for (const p of allPeaks) {
        let best = null;
        for (const el of j.elements ?? []) {
          const dist = haversine([p.lat, p.lon], [el.lat, el.lon]);
          const score = dist + (el.tags.mountain_pass === "yes" ? 0 : 800);
          if (dist < 2500 && (!best || score < best.score)) best = { score, el };
        }
        if (best) {
          const t = best.el.tags;
          p.name = t["name:en"] ?? t.name;
          p.nameLocal = t.name;
          if (t.ele && Math.abs(parseFloat(t.ele) - p.ele) < 150) p.eleOfficial = Math.round(parseFloat(t.ele));
        }
      }
      return;
    } catch (e) {
      console.warn("  overpass failed on", host, e.message);
    }
  }
}

async function weatherFor(day) {
  const { d, e, lat, lon, ts } = day.profile;
  const idx = [0, 1, 2, 3, 4, 5, 6].map((k) => Math.round((k * (d.length - 1)) / 6));
  const dates = idx.map((i) => new Date(ts[i] * 1000).toISOString().slice(0, 10)).sort();
  const url =
    "https://archive-api.open-meteo.com/v1/archive?" +
    `latitude=${idx.map((i) => lat[i]).join(",")}&longitude=${idx.map((i) => lon[i]).join(",")}` +
    `&elevation=${idx.map((i) => Math.round(e[i])).join(",")}` +
    `&start_date=${dates[0]}&end_date=${dates[dates.length - 1]}` +
    "&hourly=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,cloud_cover,weather_code,relative_humidity_2m&timezone=UTC";
  const j = await getJson(url);
  const arr = Array.isArray(j) ? j : [j];
  return idx.map((i, k) => {
    const h = arr[k].hourly;
    const target = Math.round(ts[i] / 3600) * 3600;
    let hi = h.time.findIndex((t) => Date.parse(t + ":00Z") / 1000 === target);
    if (hi < 0) hi = 0;
    const a = Math.max(0, i - 6), b = Math.min(d.length - 1, i + 6);
    const heading = bearing([lat[a], lon[a]], [lat[b], lon[b]]);
    const wind = h.wind_speed_10m[hi], dir = h.wind_direction_10m[hi];
    return {
      km: round(d[i] / 1000, 1), ts: ts[i], lat: lat[i], lon: lon[i], ele: Math.round(e[i]),
      temp: round(h.temperature_2m[hi], 1), feels: round(h.apparent_temperature[hi], 1),
      wind: round(wind, 0), gust: round(h.wind_gusts_10m[hi], 0), windDir: dir, heading: Math.round(heading),
      headwind: round(wind * Math.cos(rad(dir - heading)), 0), // + = headwind, - = tailwind
      precip: round(h.precipitation[hi], 1), cloud: h.cloud_cover[hi], humidity: h.relative_humidity_2m[hi], code: h.weather_code[hi],
    };
  });
}

async function main() {
  const acts = JSON.parse(fs.readFileSync(path.join(RAW, "activities.json"), "utf8"))
    .filter((a) => fs.existsSync(path.join(RAW, `${a.activityId}.zip`)))
    .sort((a, b) => a.startTimeLocal.localeCompare(b.startTimeLocal));
  const byDate = new Map();
  for (const a of acts) {
    const date = a.startTimeLocal.slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(a);
  }

  fs.mkdirSync(path.join(OUT, "days"), { recursive: true });
  const days = [];
  let n = 0;
  for (const [date, list] of byDate) {
    n++;
    console.log(`day ${n} ${date}: ${list.map((a) => a.activityName).join(" + ")}`);
    const pts = []; // merged records of the day
    const tot = { dist: 0, ascent: 0, descent: 0, moving: 0, elapsed: 0, cal: 0, maxSpeed: 0, maxHr: 0, hrW: 0, hrT: 0 };
    for (const a of list) {
      const fit = await parseFit(a.activityId);
      const s = fit.sessions[0];
      let last = null;
      for (const r of fit.records) {
        if (r.position_lat == null || r.distance == null) continue;
        const alt = r.enhanced_altitude ?? r.altitude;
        if (alt == null) continue;
        last = r;
        pts.push({
          d: tot.dist + r.distance, e: alt, lat: r.position_lat, lon: r.position_long,
          hr: r.heart_rate ?? null, sp: r.enhanced_speed ?? r.speed ?? null, t: r.temperature ?? null,
          ts: Math.round(new Date(r.timestamp).getTime() / 1000),
        });
      }
      tot.dist += last?.distance ?? s.total_distance;
      tot.ascent += s.total_ascent ?? 0; tot.descent += s.total_descent ?? 0;
      tot.moving += s.total_timer_time ?? 0; tot.elapsed += s.total_elapsed_time ?? 0;
      tot.cal += s.total_calories ?? 0;
      tot.maxSpeed = Math.max(tot.maxSpeed, s.enhanced_max_speed ?? s.max_speed ?? 0);
      tot.maxHr = Math.max(tot.maxHr, s.max_heart_rate ?? 0);
      if (s.avg_heart_rate) { tot.hrW += s.avg_heart_rate * s.total_timer_time; tot.hrT += s.total_timer_time; }
    }

    // resample evenly along distance (bin average = light smoothing)
    const P = { d: [], e: [], hr: [], sp: [], t: [], ts: [], lat: [], lon: [] };
    const step = tot.dist / N_PROFILE;
    let j = 0;
    for (let b = 0; b < N_PROFILE; b++) {
      const lo = b * step, hi = (b + 1) * step;
      const acc = { e: 0, hr: 0, hrN: 0, sp: 0, spN: 0, t: 0, tN: 0, n: 0 };
      let mid = null;
      while (j < pts.length && pts[j].d < hi) {
        const p = pts[j++];
        if (p.d < lo) continue;
        acc.e += p.e; acc.n++;
        if (p.hr != null) { acc.hr += p.hr; acc.hrN++; }
        if (p.sp != null) { acc.sp += p.sp; acc.spN++; }
        if (p.t != null) { acc.t += p.t; acc.tN++; }
        mid = p;
      }
      if (!acc.n) { // gap in the recording: carry the previous sample forward
        const k = P.d.length - 1;
        if (k < 0) continue;
        for (const key of Object.keys(P)) P[key].push(key === "d" ? Math.round((lo + hi) / 2) : P[key][k]);
        continue;
      }
      P.d.push(Math.round((lo + hi) / 2)); P.e.push(round(acc.e / acc.n, 1));
      P.hr.push(acc.hrN ? Math.round(acc.hr / acc.hrN) : null);
      P.sp.push(acc.spN ? round(acc.sp / acc.spN, 1) : null);
      P.t.push(acc.tN ? round(acc.t / acc.tN, 1) : null);
      P.ts.push(mid.ts); P.lat.push(round(mid.lat, 5)); P.lon.push(round(mid.lon, 5));
    }

    const temps = P.t.filter((v) => v != null);
    const first = pts[0], lastPt = pts[pts.length - 1];
    const day = {
      n, date, slug: `day-${String(n).padStart(2, "0")}`,
      activityIds: list.map((a) => a.activityId),
      startTs: first.ts, endTs: lastPt.ts,
      start: { lat: round(first.lat, 5), lon: round(first.lon, 5) },
      end: { lat: round(lastPt.lat, 5), lon: round(lastPt.lon, 5) },
      stats: {
        distanceKm: round(tot.dist / 1000, 1), ascent: Math.round(tot.ascent), descent: Math.round(tot.descent),
        movingSec: Math.round(tot.moving), elapsedSec: Math.round(tot.elapsed),
        avgSpeed: round(tot.dist / 1000 / (tot.moving / 3600), 1), maxSpeed: round(tot.maxSpeed, 1),
        avgHr: tot.hrT ? Math.round(tot.hrW / tot.hrT) : null, maxHr: tot.maxHr || null,
        maxAlt: Math.round(Math.max(...P.e)), minAlt: Math.round(Math.min(...P.e)),
        calories: Math.round(tot.cal),
        tempAvg: temps.length ? round(temps.reduce((a, b) => a + b, 0) / temps.length, 0) : null,
        tempMin: temps.length ? Math.min(...temps) : null, tempMax: temps.length ? Math.max(...temps) : null,
      },
      profile: P,
      passes: findPeaks(P.d, P.e).map((p) => ({ ...p, lat: P.lat[p.i], lon: P.lon[p.i], ele: Math.round(p.ele), km: round(p.km, 1) })),
    };
    days.push(day);
  }

  console.log("naming passes (Overpass)…");
  await namePasses(days.flatMap((d) => d.passes));

  for (const day of days) {
    console.log(`enriching day ${day.n}…`);
    Object.assign(day.start, await placeName(day.start.lat, day.start.lon));
    Object.assign(day.end, await placeName(day.end.lat, day.end.lon));
    try { day.weather = await weatherFor(day); } catch (e) { console.warn("  weather failed:", e.message); day.weather = []; }
    await sleep(400);
    fs.writeFileSync(path.join(OUT, "days", `${day.slug}.json`), JSON.stringify(day));
  }

  // trip-level summary: totals, light per-day cards, coarse overall profile + track
  const sum = (f) => days.reduce((a, d) => a + f(d), 0);
  const summary = {
    slug,
    startDate: days[0].date, endDate: days[days.length - 1].date,
    countries: [...new Set(days.flatMap((d) => [d.start.country, d.end.country]).filter(Boolean))],
    totals: {
      days: days.length, distanceKm: round(sum((d) => d.stats.distanceKm), 0), ascent: sum((d) => d.stats.ascent),
      movingSec: sum((d) => d.stats.movingSec), calories: sum((d) => d.stats.calories),
      maxAlt: Math.max(...days.map((d) => d.stats.maxAlt)), passes: sum((d) => d.passes.filter((p) => p.name).length),
    },
    days: days.map((d) => ({
      n: d.n, slug: d.slug, date: d.date, start: d.start, end: d.end, stats: d.stats,
      passes: d.passes.map(({ name, ele, km, gain }) => ({ name: name ?? null, ele, km, gain })),
      ele: d.profile.e.filter((_, i) => i % 8 === 0).map((v) => Math.round(v)),
      track: d.profile.lat.filter((_, i) => i % 6 === 0).map((la, i) => [la, d.profile.lon[i * 6]]),
    })),
  };
  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary));
  for (const d of days)
    console.log(
      `${d.slug} ${d.date} ${d.start.name} -> ${d.end.name} | ${d.stats.distanceKm}km ${d.stats.ascent}m+ | passes: ${d.passes.map((p) => `${p.name ?? "?"} ${p.ele}m`).join(", ") || "-"} | wx: ${d.weather.map((w) => `${w.temp}°/${w.wind}kmh`).join(" ")}`,
    );
}

main().catch((e) => { console.error(e); process.exit(1); });
