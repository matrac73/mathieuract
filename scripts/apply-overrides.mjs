// Applies content/adventures/<slug>/overrides.json (pass names, place names)
// to the generated day files and summary. Run after build-adventure.mjs.
import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] ?? "alps-2026";
const DIR = path.join("content", "adventures", slug);
const ov = JSON.parse(fs.readFileSync(path.join(DIR, "overrides.json"), "utf8"));
const summary = JSON.parse(fs.readFileSync(path.join(DIR, "summary.json"), "utf8"));
const place = (p) => { if (p.name && ov.places?.[p.name]) p.name = ov.places[p.name]; };

for (const s of summary.days) {
  const file = path.join(DIR, "days", `${s.slug}.json`);
  const day = JSON.parse(fs.readFileSync(file, "utf8"));
  place(day.start); place(day.end);
  for (const o of ov.passes?.[s.slug] ?? []) {
    const pk = [...day.passes].sort((a, b) => Math.abs(a.ele - o.ele) - Math.abs(b.ele - o.ele))[0];
    if (!pk || Math.abs(pk.ele - o.ele) > 25) continue;
    if (o.name === null) pk.drop = true;
    else { pk.name = o.name; pk.eleOfficial = o.official; }
  }
  day.passes = day.passes.filter((p) => !p.drop);
  for (const a of ov.add?.[s.slug] ?? []) {
    if (day.passes.some((p) => p.name === a.name)) continue;
    const { d, e, lat, lon } = day.profile;
    const i = a.atEnd ? d.length - 1 : d.findIndex((v) => v / 1000 >= a.km);
    day.passes.push({ i, km: Math.round(d[i] / 100) / 10, ele: Math.round(e[i]), gain: Math.round(e[i] - Math.min(...e.slice(0, i + 1))), lat: lat[i], lon: lon[i], name: a.name, eleOfficial: a.official });
  }
  day.passes.sort((a, b) => a.km - b.km);
  fs.writeFileSync(file, JSON.stringify(day));
  s.start = day.start; s.end = day.end;
  s.passes = day.passes.map(({ name, ele, km, gain, eleOfficial }) => ({ name: name ?? null, ele: eleOfficial ?? ele, km, gain }));
  console.log(s.slug, s.start.name, "->", s.end.name, "|", s.passes.map((p) => `${p.name} ${p.ele}m`).join(", ") || "-");
}
summary.totals.passes = summary.days.reduce((a, d) => a + d.passes.filter((p) => p.name).length, 0);
fs.writeFileSync(path.join(DIR, "summary.json"), JSON.stringify(summary));
console.log("named passes:", summary.totals.passes);
