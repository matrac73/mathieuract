// Finds the main towns each stage goes through (reverse geocoding of a few points of the route).
//   node scripts/build-towns.mjs <slug>
// Writes content/adventures/<slug>/towns.json — a plain list you can edit by hand
// (remove a town, rename it, or add one with the index `i` of the nearest profile point).
import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];
if (!slug) { console.error("usage: node scripts/build-towns.mjs <slug>"); process.exit(1); }
const DIR = path.join(process.cwd(), "content", "adventures", slug);
const UA = { "User-Agent": "personal-site-build-script/1.0" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SAMPLES = 14;

const out = {};
for (const f of fs.readdirSync(path.join(DIR, "days")).filter((x) => /^day-\d+\.json$/.test(x)).sort()) {
  const day = JSON.parse(fs.readFileSync(path.join(DIR, "days", f), "utf8"));
  const { lat, lon } = day.profile, n = lat.length, found = [];
  for (let k = 1; k < SAMPLES; k++) {
    const i = Math.round((k * (n - 1)) / SAMPLES);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=en&lat=${lat[i]}&lon=${lon[i]}`, { headers: UA, signal: AbortSignal.timeout(30000) });
      const a = (await r.json()).address ?? {};
      const name = a.city ?? a.town ?? a.village ?? a.municipality;
      const kind = a.city ? "city" : a.town ? "town" : a.village ? "village" : "other";
      if (name && !found.some((t) => t.name === name) && name !== day.start.name && name !== day.end.name) found.push({ name, i, kind });
    } catch (e) { console.warn(`  ${f} #${k}: ${e.message}`); }
    await sleep(1100); // Nominatim: at most one request per second
  }
  out[f.replace(".json", "")] = found;
  console.log(f, found.map((t) => `${t.name} (${t.kind})`).join(", "));
}
fs.writeFileSync(path.join(DIR, "towns.json"), JSON.stringify(out, null, 1));
