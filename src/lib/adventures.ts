import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import type { L10n, Locale } from "./i18n";

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
};
export type DayCard = { n: number; slug: string; date: string; start: Place; end: Place; stats: Stats; passes: Pass[]; ele: number[]; track: [number, number][] };
export type Summary = {
  slug: string; startDate: string; endDate: string; countries: string[];
  totals: { days: number; distanceKm: number; ascent: number; movingSec: number; calories: number; maxAlt: number; passes: number };
  days: DayCard[];
};
export type Meta = { order: number; title: L10n; tagline: L10n; intro: L10n; riders: number; sport: L10n };
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

export function getDays(slug: string, locale: Locale): Day[] {
  const adv = getAdventure(slug);
  if (!adv) return [];
  return adv.summary.days.map((c) => {
    const day = json<Omit<Day, "photos" | "notesHtml">>(path.join(DIR, slug, "days", `${c.slug}.json`));
    const photoDir = path.join(PUB, slug, c.slug);
    const photos = fs.existsSync(photoDir)
      ? fs.readdirSync(photoDir).filter((f) => IMG.test(f)).sort().map((f) => `/adventures/${slug}/${c.slug}/${f}`)
      : [];
    let notesHtml: string | null = null;
    for (const l of [locale, "en"]) {
      const f = path.join(DIR, slug, "notes", `${c.slug}.${l}.md`);
      if (fs.existsSync(f)) {
        const md = fs.readFileSync(f, "utf8").trim();
        if (md) { notesHtml = marked.parse(md, { async: false }) as string; break; }
      }
    }
    return { ...day, photos, notesHtml };
  });
}
