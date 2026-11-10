import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Locale } from "./i18n";

const DIR = path.join(process.cwd(), "content", "articles");

export type ArticleMeta = { slug: string; title: string; summary: string; category: string; date: string; readingMinutes: number; order: number };
export type Article = ArticleMeta & { html: string };

function read(slug: string, locale: Locale) {
  for (const l of [locale, "en"]) {
    const f = path.join(DIR, `${slug}.${l}.md`);
    if (fs.existsSync(f)) return matter(fs.readFileSync(f, "utf8"));
  }
  return null;
}

export function listSlugs(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return [...new Set(fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.(en|fr)\.md$/, "")))];
}

export function listArticles(locale: Locale): ArticleMeta[] {
  return listSlugs()
    .map((slug) => {
      const m = read(slug, locale);
      return m ? ({ slug, ...(m.data as Omit<ArticleMeta, "slug">) }) : null;
    })
    .filter((a): a is ArticleMeta => !!a)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getArticle(slug: string, locale: Locale): Article | null {
  const m = read(slug, locale);
  if (!m) return null;
  return { slug, ...(m.data as Omit<ArticleMeta, "slug">), html: marked.parse(m.content, { async: false }) as string };
}
