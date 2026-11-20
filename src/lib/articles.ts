import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Locale } from "./i18n";

const DIR = path.join(process.cwd(), "content", "articles");

export type NewsRef = { title: string; source: string; url: string; date: string };
export type ArticleMeta = {
  slug: string; title: string; summary: string; category: string; date: string; written?: string; scene?: string; readingMinutes: number; order: number;
  // "perspective" articles: a recent news item read through one of the courses followed at CentraleSupélec
  hook?: string; course?: string; courseSlug?: string; news?: NewsRef;
};
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
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || b.date.localeCompare(a.date));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Inline SVG of a figure, stripped of anything that could run or load something. */
function loadSvg(slug: string, file: string): string {
  const f = path.join(DIR, slug, path.basename(file));
  if (!fs.existsSync(f)) return "";
  return fs.readFileSync(f, "utf8")
    .replace(/<\?xml[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<!--[\s\S]*?-->/g, "")
    .replace(/<(script|foreignObject|iframe|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/\s(xlink:)?href\s*=\s*("(?!#)[^"]*"|'(?!#)[^']*')/gi, "")
    .replace(/<svg([^>]*?)\s(?:width|height)="[^"]*"/gi, "<svg$1")
    .replace(/<svg([^>]*?)\s(?:width|height)="[^"]*"/gi, "<svg$1")
    // on one line: a blank line inside the SVG would end the HTML block for the markdown parser,
    // and the rest of the drawing would come out as plain text under the figure
    .replace(/\s*\r?\n\s*/g, " ")
    .trim();
}

/**
 * ```figure blocks become a scroll-driven figure: the SVG stays pinned while the steps scroll by,
 * and each step reveals the SVG elements carrying data-step <= its number.
 *   file: fig-1.svg / caption: ... / scroll: ... (how it animates, shown in the mail only) / steps: - ...
 */
function figures(md: string, slug: string): string {
  return md.replace(/```figure\r?\n([\s\S]*?)\r?\n```/g, (_, body: string) => {
    const f: Record<string, string> = {};
    const steps: string[] = [];
    let inSteps = false;
    for (const raw of body.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      const item = line.match(/^(?:-|\d+\.)\s+(.*)$/);
      if (inSteps && item) { steps.push(item[1]); continue; }
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (kv) { inSteps = kv[1] === "steps"; if (!inSteps) f[kv[1]] = kv[2]; }
    }
    const svg = loadSvg(slug, f.file ?? "");
    if (!svg) return "";
    const lis = steps.map((s, i) => `<li data-step="${i + 1}"><span class="label">${i + 1} / ${steps.length}</span><p>${marked.parseInline(s, { async: false })}</p></li>`).join("");
    return `\n\n<section class="scrolly"><figure class="scrolly-fig"><div class="scrolly-svg">${svg}</div>${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ""}</figure>${lis ? `<ol class="scrolly-steps">${lis}</ol>` : ""}</section>\n\n`;
  });
}

export function getArticle(slug: string, locale: Locale): Article | null {
  const m = read(slug, locale);
  if (!m) return null;
  return { slug, ...(m.data as Omit<ArticleMeta, "slug">), html: marked.parse(figures(m.content, slug), { async: false }) as string };
}
