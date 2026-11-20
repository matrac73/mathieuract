import data from "../../content/courses.json";
import type { ArticleMeta } from "./articles";
import type { Locale } from "./i18n";

// Courses followed at CentraleSupélec (content/courses.json): one line on what each one teaches.
// An article is attached to its course by `courseSlug` in its front matter, or failing that by the course name.

export type Course = { slug: string; course: string; year: string; theme: string; fr: string; en: string };
export const courses = data.courses as Course[];
export const themes = data.themes as { id: string; fr: string; en: string }[];
export const years = ["1A", "2A", "3A"] as const;

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const byName = new Map(courses.map((c) => [norm(c.course), c]));
const bySlug = new Map(courses.map((c) => [c.slug, c]));

/** Name as shown: no year suffix, and the apostrophes the file names could not carry. */
export const courseName = (c: Course) => c.course.replace(/\s*\((?:1A|2A|3A)\)$/, "").replace(/([A-Za-zÀ-ÿ])_(?=[A-Za-zÀ-ÿ])/g, "$1'");

export function courseOf(a: Pick<ArticleMeta, "course" | "courseSlug">): Course | undefined {
  return (a.courseSlug && bySlug.get(a.courseSlug)) || (a.course ? byName.get(norm(a.course)) : undefined);
}

/** Courses of one year, grouped by theme, each with the articles that use it. */
export function coursesByYear(articles: ArticleMeta[], locale: Locale) {
  const using = new Map<string, ArticleMeta[]>();
  for (const a of articles) { const c = courseOf(a); if (c) using.set(c.slug, [...(using.get(c.slug) ?? []), a]); }
  return years.map((year) => ({
    year,
    groups: themes.map((t) => ({
      theme: t[locale],
      items: courses.filter((c) => c.year === year && c.theme === t.id).map((c) => ({ ...c, name: courseName(c), text: c[locale], articles: (using.get(c.slug) ?? []).sort((x, y) => y.date.localeCompare(x.date)) })),
    })).filter((g) => g.items.length),
  }));
}
