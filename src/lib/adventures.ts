import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";
import { marked } from "marked";
import type { L10n, Locale } from "./i18n";
import { averagePower, estimatePower } from "./ride";

const DIR = path.join(process.cwd(), "content", "adventures");
const PUB = path.join(process.cwd(), "public", "adventures");

export type Place = { lat: number; lon: number; name: string | null; country: string };
export type Stats = {
  distanceKm: number; ascent: number; descent: number; movingSec: number; elapsedSec: number;
  avgSpeed: number; maxSpeed: number; avgHr: number | null; maxHr: number | null;
  maxAlt: number; minAlt: number; calories: number; tempAvg: number | null; tempMin: number | null; tempMax: number | null;
};
export type Pass = { name: string | null; ele: number; km: number; gain: number; eleOfficial?: number; lat?: number; lon?: number };
export type Weather = {
  km: number; ts: number; lat: number; lon: number; ele: number; temp: number; feels: number; wind: number; gust: number;
  windDir: number; heading: number; headwind: number; precip: number; cloud: number; humidity: number; code: number;
};
export type Profile = { d: number[]; e: number[]; hr: (number | null)[]; sp: (number | null)[]; t: (number | null)[]; ts: number[]; lat: number[]; lon: number[] };
export type Day = {
  n: number; date: string; slug: string; startTs: number; endTs: number; start: Place; end: Place;
  stats: Stats; profile: Profile; passes: Pass[]; weather: Weather[];
  photos: string[]; notesHtml: string | null;
  media: Media[]; // photos and videos, placed on the route where they were taken
  avgPower: number; // estimated (no power meter)
  towns: { name: string; i: number }[]; // main towns on the way, `i` = index of the nearest profile point (towns.json)
};
export type Media = { src: string; at: number; video: boolean }; // `at` = 0..1 along the day's route
export type DayCard = { n: number; slug: string; date: string; start: Place; end: Place; stats: Stats; passes: Pass[]; ele: number[]; track: [number, number][] };
export type Summary = {
  slug: string; startDate: string; endDate: string; countries: string[];
  totals: { days: number; distanceKm: number; ascent: number; movingSec: number; calories: number; maxAlt: number; passes: number };
  days: DayCard[];
};
export type Meta = { order: number; title: L10n; tagline: L10n; intro: L10n; riders: number; sport: L10n; kind?: string; massKg?: number };
export type Adventure = { slug: string; meta: Meta; summary: Summary; cover: string | null };

const json = <T,>(f: string): T => JSON.parse(fs.readFileSync(f, "utf8")) as T;
const IMG = /\.(jpe?g|png|webp|avif)$/i;

export function listAdventures(): Adventure[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((s) => fs.existsSync(path.join(DIR, s, "meta.json")) && fs.existsSync(path.join(DIR, s, "summary.json")))
    .map((slug) => {
      const cover = ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"].find((f) => fs.existsSync(path.join(PUB, slug, f)));
      return { slug, meta: json<Meta>(path.join(DIR, slug, "meta.json")), summary: json<Summary>(path.join(DIR, slug, "summary.json")), cover: cover ? `/adventures/${slug}/${cover}` : null };
    })
    .sort((a, b) => b.meta.order - a.meta.order);
}

export function getAdventure(slug: string): Adventure | null {
  return listAdventures().find((a) => a.slug === slug) ?? null;
}

const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

/**
 * Where on the day's route a photo or video was taken (0..1). In order of trust:
 * a `km042` in the file name, the GPS position stored in the photo, its capture time, else spread evenly.
 */
async function locate(file: string, name: string, p: Profile, fallback: number): Promise<number> {
  const n = p.d.length, total = p.d[n - 1];
  const km = /(?:^|[_\- ])km[_-]?(\d+(?:[.,]\d+)?)/i.exec(name);
  if (km) return Math.min(1, (Number(km[1].replace(",", ".")) * 1000) / total);
  const nearest = (score: (i: number) => number) => { let best = 0, bs = Infinity; for (let i = 0; i < n; i++) { const s = score(i); if (s < bs) { bs = s; best = i; } } return [best / (n - 1), bs] as const; };
  if (IMG.test(name)) {
    try {
      const x = await exifr.parse(file, { gps: true, reviveValues: false, pick: ["DateTimeOriginal", "GPSLatitude", "GPSLongitude", "GPSLatitudeRef", "GPSLongitudeRef"] });
      if (x && typeof x.latitude === "number" && typeof x.longitude === "number") {
        const [at, d] = nearest((i) => Math.hypot((p.lat[i] - x.latitude) * 111, (p.lon[i] - x.longitude) * 78));
        if (d < 3) return at; // within 3 km of the road
      }
      const m = typeof x?.DateTimeOriginal === "string" ? /(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)/.exec(x.DateTimeOriginal) : null;
      if (m) {
        const ts = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) / 1000 - 7200; // the camera clock was on CEST
        if (ts >= p.ts[0] - 900 && ts <= p.ts[n - 1] + 900) return nearest((i) => Math.abs(p.ts[i] - ts))[0];
      }
    } catch { /* unreadable metadata: fall through */ }
  }
  return fallback;
}

export async function getDays(slug: string, locale: Locale): Promise<Day[]> {
  const adv = getAdventure(slug);
  if (!adv) return [];
  return Promise.all(adv.summary.days.map(async (c) => {
    const day = json<Omit<Day, "photos" | "notesHtml" | "towns" | "media" | "avgPower">>(path.join(DIR, slug, "days", `${c.slug}.json`));
    const townsFile = path.join(DIR, slug, "towns.json");
    const towns = fs.existsSync(townsFile) ? (json<Record<string, { name: string; i: number }[]>>(townsFile)[c.slug] ?? []) : [];
    const photoDir = path.join(PUB, slug, c.slug);
    const files = fs.existsSync(photoDir) ? fs.readdirSync(photoDir).filter((f) => IMG.test(f) || VIDEO.test(f)).sort() : [];
    const media: Media[] = await Promise.all(files.map(async (f, i) => ({
      src: `/adventures/${slug}/${c.slug}/${f}`, video: VIDEO.test(f),
      at: await locate(path.join(photoDir, f), f, day.profile, (i + 1) / (files.length + 1)),
    })));
    let notesHtml: string | null = null;
    for (const l of [locale, "en"]) {
      const f = path.join(DIR, slug, "notes", `${c.slug}.${l}.md`);
      if (fs.existsSync(f)) {
        const md = fs.readFileSync(f, "utf8").trim();
        if (md) { notesHtml = marked.parse(md, { async: false }) as string; break; }
      }
    }
    const avgPower = averagePower(day.profile, estimatePower(day.profile, day.weather, adv.meta.massKg ?? 85));
    return { ...day, photos: media.filter((m) => !m.video).map((m) => m.src), media, notesHtml, avgPower, towns: towns.map(({ name, i }) => ({ name, i })) };
  }));
}