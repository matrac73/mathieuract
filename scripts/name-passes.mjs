// Names the detected high points of each day from OpenStreetMap (Overpass),
// one small query per peak, then refreshes summary.json. Safe to re-run.
// Usage: node scripts/name-passes.mjs <slug>
import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] ?? "alps-2026";
const DIR = path.join("content", "adventures", slug);
const HOSTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const rad = (d) => (d * Math.PI) / 180;
const dist = (a, b) => {
  const R = 6371000, dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

async function overpass(q) {
  for (const host of HOSTS) {
    try {
      const r = await fetch(host, {
        method: "POST", signal: AbortSignal.timeout(25000),
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "personal-site-build-script/1.0" },
        body: "data=" + encodeURIComponent(q),
      });
      if (r.ok) return await r.json();
    } catch {}
  }
  return null;
}

const files = fs.readdirSync(path.join(DIR, "days")).filter((f) => f.endsWith(".json")).sort();
const summary = JSON.parse(fs.readFileSync(path.join(DIR, "summary.json"), "utf8"));
for (const f of files) {
  const p = path.join(DIR, "days", f);
  const day = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const pk of day.passes) {
    if (pk.name) continue;
    const q = `[out:json][timeout:20];(node(around:2500,${pk.lat},${pk.lon})["mountain_pass"="yes"]["name"];node(around:2500,${pk.lat},${pk.lon})["natural"="saddle"]["name"];);out body;`;
    const j = await overpass(q);
    let best = null;
    for (const el of j?.elements ?? []) {
      const d = dist([pk.lat, pk.lon], [el.lat, el.lon]);
      const score = d + (el.tags.mountain_pass === "yes" ? 0 : 800);
      if (!best || score < best.score) best = { score, el };
    }
    if (best) {
      const t = best.el.tags;
      pk.name = t.name;
      if (t.ele && Math.abs(parseFloat(t.ele) - pk.ele) < 150) pk.eleOfficial = Math.round(parseFloat(t.ele));
    }
    console.log(`${day.slug} km ${pk.km} ${pk.ele}m (+${pk.gain}) -> ${pk.name ?? (j ? "no named pass nearby" : "OVERPASS UNAVAILABLE")}`);
  }
  fs.writeFileSync(p, JSON.stringify(day));
  const s = summary.days.find((d) => d.slug === day.slug);
  s.passes = day.passes.map(({ name, ele, km, gain }) => ({ name: name ?? null, ele, km, gain }));
}
summary.totals.passes = summary.days.reduce((a, d) => a + d.passes.filter((p) => p.name).length, 0);
fs.writeFileSync(path.join(DIR, "summary.json"), JSON.stringify(summary));
