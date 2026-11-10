// Downloads the original activity files (FIT, zipped) of a date range from the
// Garmin Connect Personal API into data-raw/garmin/ (git-ignored).
// Usage: node scripts/garmin-fetch.mjs 2026-07-30 2026-08-07
// Needs GARMIN_PERSONAL_API_KEY in .env.local
import fs from "node:fs";
import path from "node:path";

const BASE = "https://personal.connectapi.garmin.com";
const [start = "2026-07-30", end = "2026-08-07"] = process.argv.slice(2);

function readKey() {
  if (process.env.GARMIN_PERSONAL_API_KEY) return process.env.GARMIN_PERSONAL_API_KEY;
  const env = fs.readFileSync(".env.local", "utf8");
  const m = env.match(/^GARMIN_PERSONAL_API_KEY=(.+)$/m);
  if (!m) throw new Error("GARMIN_PERSONAL_API_KEY missing in .env.local");
  return m[1].trim();
}

async function main() {
  const tokRes = await fetch(`${BASE}/personalapitoken-service/personal-api/personal-api-key/token`, {
    method: "POST",
    headers: { Authorization: `ApiKey ${readKey()}`, Accept: "*/*" },
  });
  if (!tokRes.ok) throw new Error(`token: HTTP ${tokRes.status} ${await tokRes.text()}`);
  const bearer = (await tokRes.text()).trim(); // the response body is the raw JWT
  const H = { Authorization: `Bearer ${bearer}`, Accept: "application/json" };

  const q = new URLSearchParams({ start: "0", limit: "100", startDate: start, endDate: end });
  const listRes = await fetch(`${BASE}/activitylist-service/activities/search/activities?${q}`, { headers: H });
  if (!listRes.ok) throw new Error(`search: HTTP ${listRes.status} ${await listRes.text()}`);
  const list = await listRes.json();
  const acts = Array.isArray(list) ? list : (list.activities ?? list.data ?? []);

  const out = path.join("data-raw", "garmin");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "activities.json"), JSON.stringify(acts, null, 1));

  for (const a of acts) {
    const id = a.activityId;
    console.log(
      [id, a.startTimeLocal, a.activityType?.typeKey, a.activityName,
       `${((a.distance ?? 0) / 1000).toFixed(1)}km`, `${Math.round(a.elevationGain ?? 0)}m+`,
       `${Math.round((a.duration ?? 0) / 60)}min`, `hr${a.averageHR ?? "-"}`, `pw${a.avgPower ?? "-"}`].join(" | "),
    );
    const dest = path.join(out, `${id}.zip`);
    if (fs.existsSync(dest)) continue;
    const r = await fetch(`${BASE}/download-service/files/activity/${id}`, {
      headers: { ...H, Accept: "application/zip, application/x-zip-compressed, application/octet-stream" },
    });
    if (!r.ok) { console.log(`  download failed: HTTP ${r.status}`); continue; }
    fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  }
  console.log(`${acts.length} activities -> ${out}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
