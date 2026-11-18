// Photos and videos of an adventure, straight from the phone, placed on the route.
//
//   node scripts/import-media.mjs <slug> <folder> [--dry]
//
// For every file of <folder>: reads when and where it was taken (EXIF / QuickTime tags), finds the day and the
// spot on that day's route (GPS first, capture time otherwise), then writes a web-sized copy to
// public/adventures/<slug>/day-NN/ — photos as JPEG, videos cut to 3 silent seconds — and records the result in
// content/adventures/<slug>/media.json (position along the day 0..1, km, local time, title).
// Titles already written in media.json are kept. The Live Photo clip that comes with a picture is ignored.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";

const [slug, src] = process.argv.slice(2);
const dry = process.argv.includes("--dry");
if (!slug || !src) { console.error("usage: node scripts/import-media.mjs <slug> <folder> [--dry]"); process.exit(1); }

const DIR = path.join("content", "adventures", slug), PUB = path.join("public", "adventures", slug);
const TZ = 7200; // the whole route was ridden on CEST
const IMG = /\.(heic|heif|jpe?g|png|webp)$/i, VID = /\.(mov|mp4|m4v)$/i;
const days = fs.readdirSync(path.join(DIR, "days")).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(DIR, "days", f), "utf8")));
const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 26 });
const probe = (f) => JSON.parse(run("ffprobe", ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", f]));

// "2026:08:01 14:03:22" (+ optional "+02:00") → unix seconds
const exifTs = (s, off) => {
  const m = /(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)/.exec(s ?? "");
  if (!m) return null;
  const o = /([+-])(\d\d):(\d\d)/.exec(off ?? ""), shift = o ? (o[1] === "-" ? -1 : 1) * (+o[2] * 3600 + +o[3] * 60) : TZ;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) / 1000 - shift;
};

async function read(file) {
  const name = path.basename(file);
  if (IMG.test(name)) {
    let x = null;
    const buf = fs.readFileSync(file), opt = { gps: true, xmp: true, reviveValues: false };
    try { x = await exifr.parse(buf, opt); } catch { /* a container exifr does not know (recent HEIC): look for the EXIF block ourselves */
      const tiff = Math.max(buf.indexOf("Exif\0\0MM\0*", 0, "latin1"), buf.indexOf("Exif\0\0II*\0", 0, "latin1")) + 6;
      if (tiff > 6) try { x = await exifr.parse(buf.subarray(tiff), opt); } catch { /* no metadata */ }
    }
    const ts = exifTs(x?.DateTimeOriginal ?? x?.CreateDate, x?.OffsetTimeOriginal) ?? (x?.DateCreated ? Date.parse(x.DateCreated) / 1000 || null : null);
    return { ts, lat: typeof x?.latitude === "number" ? x.latitude : null, lon: typeof x?.longitude === "number" ? x.longitude : null };
  }
  const p = probe(file), tags = p.format?.tags ?? {};
  const when = tags["com.apple.quicktime.creationdate"] ?? tags.creation_time;
  const named = /(\d\d)-(\d\d)-(\d{4}) (\d\d)-(\d\d)-(\d\d)/.exec(name); // ScreenRecording_08-03-2026 23-02-22
  const loc = /([+-]\d+\.\d+)([+-]\d+\.\d+)/.exec(tags["com.apple.quicktime.location.ISO6709"] ?? "");
  const v = p.streams.find((s) => s.codec_type === "video");
  return {
    ts: named ? Date.UTC(+named[3], +named[1] - 1, +named[2], +named[4], +named[5], +named[6]) / 1000 - TZ : when ? Date.parse(when) / 1000 : null,
    lat: loc ? +loc[1] : null, lon: loc ? +loc[2] : null,
    duration: +p.format.duration, hdr: /arib-std-b67|smpte2084/.test(v?.color_transfer ?? ""), height: v?.height ?? 0,
  };
}

// the day a moment belongs to: its date on the road (a photo taken after midnight still belongs to the evening before)
const dayOf = (ts) => { const d = new Date((ts + TZ - 4 * 3600) * 1000).toISOString().slice(0, 10); return days.find((x) => x.date === d) ?? (ts < days[0].startTs && ts > days[0].startTs - 86400 ? days[0] : null); }; // the eve of the start counts as day 1

function place(day, m) {
  const P = day.profile, n = P.d.length;
  if (m.lat != null) {
    const dist = P.lat.map((la, i) => Math.hypot((la - m.lat) * 111, (P.lon[i] - m.lon) * 111 * Math.cos((la * Math.PI) / 180)));
    const min = Math.min(...dist);
    if (min < 3) { // on the road: when the route passes there twice, the capture time says which time it was
      let best = dist.indexOf(min);
      if (m.ts != null) { let bt = Infinity; dist.forEach((d, i) => { if (d <= min + 0.25 && Math.abs(P.ts[i] - m.ts) < bt) { bt = Math.abs(P.ts[i] - m.ts); best = i; } }); }
      return { i: best, by: "gps", off: min };
    }
  }
  if (m.ts != null) { let best = 0, bt = Infinity; P.ts.forEach((t, i) => { if (Math.abs(t - m.ts) < bt) { bt = Math.abs(t - m.ts); best = i; } }); return { i: best, by: "time", off: null }; }
  return null;
}

const files = fs.readdirSync(src).filter((f) => IMG.test(f) || VID.test(f)).sort();
const stills = new Set(files.filter((f) => IMG.test(f)).map((f) => path.parse(f).name.toLowerCase()));
const mediaFile = path.join(DIR, "media.json");
const known = fs.existsSync(mediaFile) ? JSON.parse(fs.readFileSync(mediaFile, "utf8")) : {};
const out = {}, skipped = [];

for (const f of files) {
  const base = path.parse(f).name;
  if (VID.test(f) && stills.has(base.toLowerCase())) continue; // the moving half of a Live Photo
  const m = await read(path.join(src, f)), day = m.ts != null ? dayOf(m.ts) : null, spot = day && place(day, m);
  if (!day || !spot) { skipped.push(`${f} — ${m.ts ? new Date((m.ts + TZ) * 1000).toISOString().slice(0, 16).replace("T", " ") : "no date"}${m.lat != null ? ` @ ${m.lat.toFixed(3)},${m.lon.toFixed(3)}` : ""}`); continue; }
  const P = day.profile, time = new Date((m.ts + TZ) * 1000).toISOString().slice(11, 16), video = VID.test(f);
  const file = `${time.replace(":", "")}_${base.replace(/[^\w-]+/g, "-").slice(0, 24)}.${video ? "mp4" : "jpg"}`;
  const rec = { file, at: +(spot.i / (P.d.length - 1)).toFixed(4), km: +(P.d[spot.i] / 1000).toFixed(1), time, by: spot.by, video, title: known[day.slug]?.find((k) => k.file === file)?.title ?? { en: "", fr: "" } };
  (out[day.slug] ??= []).push(rec);
  console.log(`${day.slug}  ${time}  km ${String(rec.km).padStart(5)}  ${spot.by.padEnd(4)} ${spot.off != null ? `${spot.off.toFixed(2)} km off` : "           "}  ${f}${m.ts < day.startTs - 600 ? "  (before the start)" : m.ts > day.endTs + 600 ? "  (after the finish)" : ""}`);
  if (dry) continue;
  const dir = path.join(PUB, day.slug), dst = path.join(dir, file);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dst)) convert(path.join(src, f), dst, dir, video, m);
  const size = probe(dst).streams.find((x) => x.codec_type === "video"); // kept so the page can reserve the room before the picture loads
  rec.w = size.width; rec.h = size.height;
}

function convert(from, dst, dir, video, m) {
  if (video) {
    const start = Math.max(0, m.duration / 2 - 1.5).toFixed(2);
    const tone = m.hdr ? "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv," : "";
    run("ffmpeg", ["-v", "error", "-y", "-ss", start, "-i", from, "-t", "3", "-an", "-vf", `${tone}scale=-2:'min(720,ih)',format=yuv420p`, "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-movflags", "+faststart", dst]);
  } else {
    // two steps: an iPhone HEIC is a grid of tiles that ffmpeg assembles itself, and that cannot be combined with a filter
    const tmp = path.join(dir, "_tmp.png");
    run("ffmpeg", ["-v", "error", "-y", "-i", from, "-frames:v", "1", "-update", "1", tmp]);
    run("ffmpeg", ["-v", "error", "-y", "-i", tmp, "-vf", "scale='min(1600,iw)':'min(1600,ih)':force_original_aspect_ratio=decrease", "-frames:v", "1", "-update", "1", "-q:v", "5", "-map_metadata", "-1", dst]);
    fs.rmSync(tmp);
  }
}

for (const k of Object.keys(out)) out[k].sort((a, b) => a.at - b.at || a.time.localeCompare(b.time));
console.log(`\n${Object.values(out).flat().length} placed — ${Object.entries(out).sort().map(([k, v]) => `${k}: ${v.length}`).join(", ")}`);
if (skipped.length) console.log(`\nnot placed (${skipped.length}):\n  ${skipped.join("\n  ")}`);
if (!dry) fs.writeFileSync(mediaFile, JSON.stringify(Object.fromEntries(Object.entries(out).sort()), null, 1) + "\n");
